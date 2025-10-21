/*
                                            _               _     __   __
         /\  | |                           | |             (_)    \ \ / /
        /  \ | |_ _ __ ___   ___  ___ _ __ | |__   ___ _ __ _  ___ \ V / 
       / /\ \| __| "_ ` _ \ / _ \/ __| "_ \| "_ \ / _ \ "__| |/ __| > <  
      / ____ \ |_| | | | | | (_) \__ \ |_) | | | |  __/ |  | | (__ / . \ 
     /_/    \_\__|_| |_| |_|\___/|___/ .__/|_| |_|\___|_|  |_|\___/_/ \_\
                                     | |                                 
                                     |_|                                                                                                                
    
    Written by: KiyoWx (k3yomi)                
*/

import * as loader from '../bootstrap';
import * as types from '../types';


export class UGCParser {
    
    /**
     * @function ugcExtractor
     * @description
     *     Extracts UGC (Universal Geographic Code) information from a message.
     *     This includes parsing the header, resolving zones, calculating the expiry
     *     date, and retrieving associated location names from the database.
     *
     * @static
     * @async
     * @param {string} message
     * @returns {Promise<types.UGCEntry | null>}
     */
    public static async ugcExtractor(message: string): Promise<types.UGCEntry | null> {
        const header = this.getHeader(message);
        if (!header) return null;
        const zones = this.getZones(header);
        if (zones.length === 0) return null;
        const expiry = this.getExpiry(message);
        const locations = await this.getLocations(zones);
        return { 
            zones: zones, 
            locations: locations,
            expiry: expiry
        };
    }

    /**
     * @function getHeader
     * @description
     *     Extracts the UGC header from a message by locating patterns defined in
     *     `ugc1` and `ugc2` regular expressions. Removes all whitespace and the
     *     trailing character from the matched header.
     *
     * @static
     * @param {string} message
     * @returns {string | null}
     */
    public static getHeader(message: string): string | null {
        const start = message.search(new RegExp(loader.definitions.expressions.ugc1, "gimu"));
        if (start === -1) return null;
        const subMessage = message.substring(start);
        const end = subMessage.search(new RegExp(loader.definitions.expressions.ugc2, "gimu"));
        if (end === -1) return null;
        const full = subMessage.substring(0, end).replace(/\s+/g, '').slice(0, -1);
        return full || null;
    }

    /**
     * @function getExpiry
     * @description
     *     Extracts an expiration date from a message using the UGC3 format.
     *     The function parses day, hour, and minute from the message and constructs
     *     a Date object in the current month and year. Returns `null` if no valid
     *     expiration is found.
     *
     * @static
     * @param {string} message
     * @returns {Date | null}
     */
    public static getExpiry(message: string): Date | null {
        const start = message.match(new RegExp(loader.definitions.expressions.ugc3, "gimu"));
        if (start != null) { 
            const day = parseInt(start[0].substring(0, 2), 10);
            const hour = parseInt(start[0].substring(2, 4), 10);
            const minute = parseInt(start[0].substring(4, 6), 10);
            const now = new Date();
            const expires = new Date(now.getUTCFullYear(), now.getUTCMonth(), day, hour, minute, 0);
            return expires;
        }
        return null;
    }

    /**
     * @function getLocations
     * @description
     *     Retrieves human-readable location names for an array of zone identifiers
     *     from the shapefiles database. If a zone is not found, the zone ID itself
     *     is returned. Duplicate locations are removed and the result is sorted.
     *
     * @static
     * @async
     * @param {string[]} zones
     * @returns {Promise<string[]>}
     */
    public static async getLocations (zones: String[]): Promise<string[]> {
        const locations: string[] = [];
        for (let i = 0; i < zones.length; i++) {
            const id = zones[i].trim();
            const located = await loader.cache.db.prepare(`
                SELECT location FROM shapefiles WHERE id = ?`
            ).get(id);
            located != undefined ? locations.push(located.location) : locations.push(id);
        }
        return Array.from(new Set(locations)).sort();
    }

    /**
     * @function getCoordinates
     * @description
     *     Retrieves geographic coordinates for an array of zone identifiers
     *     from the shapefiles database. Returns the coordinates of the first
     *     polygon found for any matching zone.
     *
     * @static
     * @param {string[]} zones
     * @returns {[number, number][]}
     */
    public static getCoordinates (zones: String[]): [number, number][] {
        let coordinates: [number, number][] = [];
        for (let i = 0; i < zones.length; i++) {
            const id = zones[i].trim();
            const row = loader.cache.db.prepare(
                `SELECT geometry FROM shapefiles WHERE id = ?`
            ).get(id);
            if (row != undefined) {
                let geometry = JSON.parse(row.geometry);
                if (geometry?.type === 'Polygon') {
                    coordinates.push(...geometry.coordinates[0].map((coord: [number, number]) => [coord[1], coord[0]]));
                    break;
                }
            }
        }
        return coordinates;
    }

    /**
     * @function getZones
     * @description
     *     Parses a UGC header string and returns an array of individual zone
     *     identifiers. Handles ranges indicated with `>` and preserves the
     *     state and format prefixes.
     *
     * @static
     * @param {string} header
     * @returns {string[]}
     */
    public static getZones(header: string): string[] {
        const ugcSplit = header.split('-');
        const zones: string[] = [];
        let state = ugcSplit[0].substring(0, 2);
        const format = ugcSplit[0].substring(2, 3);
        for (const part of ugcSplit) {
            if (/^[A-Z]/.test(part)) {
                state = part.substring(0, 2);
                if (part.includes('>')) {
                    const [start, end] = part.split('>');
                    const startNum = parseInt(start.substring(3), 10);
                    const endNum = parseInt(end, 10);
                    for (let j = startNum; j <= endNum; j++) {
                        zones.push(`${state}${format}${j.toString().padStart(3, '0')}`);
                    }
                } else {
                    zones.push(part);
                }
                continue;
            }
            if (part.includes('>')) {
                const [start, end] = part.split('>');
                const startNum = parseInt(start, 10);
                const endNum = parseInt(end, 10);
                for (let j = startNum; j <= endNum; j++) {
                    zones.push(`${state}${format}${j.toString().padStart(3, '0')}`);
                }
            } else {
                zones.push(`${state}${format}${part}`);
            }
        }
        return zones.filter(item => item !== '');
    }
   
}

export default UGCParser;