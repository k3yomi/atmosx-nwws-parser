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


export class UGCParser {

    /**
     * ugcExtractor extracts and parses UGC codes from a given message string.
     *
     * @public
     * @static
     * @async
     * @param {string} message 
     * @returns {unknown} 
     */
    public static async ugcExtractor(message: string) {
        const header = this.getHeader(message);
        const zones = this.getZones(header);
        const expiry = this.getExpiry(message)
        const locations = await this.getLocations(zones)
        const ugc = zones.length > 0 ? { zones, locations, expiry } : null;
        return ugc;
    }

    /**
     * getHeader extracts the UGC header from a UGC message string.
     *
     * @public
     * @static
     * @param {string} message 
     * @returns {*} 
     */
    public static getHeader(message: string) {
        const start = message.search(new RegExp(loader.definitions.expressions.ugc1, "gimu"));
        const end = message.substring(start).search(new RegExp(loader.definitions.expressions.ugc2, "gimu"));
        const full = message.substring(start, start + end).replace(/\s+/g, '').slice(0, -1);
        return full;
    }

    /**
     * getExpiry extracts the expiry date and time from a UGC message and returns it as a Date object.
     *
     * @public
     * @static
     * @param {string} message 
     * @returns {*} 
     */
    public static getExpiry (message: string) {
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
     * getLocations retrieves unique location names for the provided UGC zone codes from the database.
     *
     * @public
     * @static
     * @async
     * @param {String[]} zones 
     * @returns {unknown} 
     */
    public static async getLocations (zones: String[]) {
        const locations: string[] = [];
        for (let i = 0; i < zones.length; i++) {
            const id = zones[i].trim();
            const located = await loader.cache.db.prepare(`SELECT location FROM shapefiles WHERE id = ?`).get(id);
            located != undefined ? locations.push(located.location) : locations.push(id);
        }
        return Array.from(new Set(locations)).sort();
    }

    /**
     * getCoordinates retrieves geographical coordinates for the provided UGC zone codes from the database.
     *
     * @public
     * @static
     * @param {String[]} zones 
     * @returns {{}} 
     */
    public static getCoordinates (zones: String[]) {
        let coordinates: [number, number][] = [];
        for (let i = 0; i < zones.length; i++) {
            const id = zones[i].trim();
            let located = loader.cache.db.prepare(`SELECT geometry FROM shapefiles WHERE id = ?`).get(id);
            if (located != undefined) {
                let geometry = JSON.parse(located.geometry);
                if (geometry?.type === 'Polygon') {
                    coordinates.push(...geometry.coordinates[0].map((coord: [number, number]) => [coord[0], coord[1]]));
                    break;
                }
            }
        }
        return coordinates;
    }

    /**
     * getZones parses a UGC header string and returns an array of individual UGC zone codes.
     *
     * @public
     * @static
     * @param {string} header 
     * @returns {*} 
     */
    public static getZones (header: string) {
        const ugcSplit = header.split('-') 
        const zones: string[] = [];
        let state = ugcSplit[0].substring(0, 2)
        let format = ugcSplit[0].substring(2, 3);
        for (let i = 0; i < ugcSplit.length; i++) {
            if (/^[A-Z]/.test(ugcSplit[i])) {
                state = ugcSplit[i].substring(0, 2);
                if (ugcSplit[i].includes('>')) {
                    let [start, end] = ugcSplit[i].split('>'), startNum = parseInt(start.substring(3), 10), endNum = parseInt(end, 10);
                    for (let j = startNum; j <= endNum; j++) zones.push(`${state}${format}${j.toString().padStart(3, '0')}`);
                } else zones.push(ugcSplit[i]);
                continue;
            }
            if (ugcSplit[i].includes('>')) {
                let [start, end] = ugcSplit[i].split('>'), startNum = parseInt(start, 10), endNum = parseInt(end, 10);
                for (let j = startNum; j <= endNum; j++) zones.push(`${state}${format}${j.toString().padStart(3, '0')}`);
            } else zones.push(`${state}${format}${ugcSplit[i]}`);
        }
        return zones.filter(item => item !== '');
    }
    
}

export default UGCParser;