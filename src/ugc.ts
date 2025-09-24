/*
                                            _               _     __   __
         /\  | |                           | |             (_)    \ \ / /
        /  \ | |_ _ __ ___   ___  ___ _ __ | |__   ___ _ __ _  ___ \ V / 
       / /\ \| __| '_ ` _ \ / _ \/ __| '_ \| '_ \ / _ \ '__| |/ __| > <  
      / ____ \ |_| | | | | | (_) \__ \ |_) | | | |  __/ |  | | (__ / . \ 
     /_/    \_\__|_| |_| |_|\___/|___/ .__/|_| |_|\___|_|  |_|\___/_/ \_\
                                     | |                                 
                                     |_|                                                                                                                
    
    Written by: k3yomi@GitHub                        
*/

import * as loader from '../bootstrap';


export class mUgcParser {

    /**
      * @function getUGC
      * @description Extracts UGC codes and associated locations from a weather alert message.
      * 
      * @param {string} message - The full text message to search within.
      */

    static async getUGC (message: string) {
        const header = this.getHeader(message);
        const zones = this.getZones(header);
        const locations = await this.getLocations(zones);
        const ugc = zones.length > 0 ? { zones, locations} : null;
        return ugc;
    }

    /**
      * @function getHeader
      * @description Extracts the UGC header from a weather alert message.
      * 
      * @param {string} message - The full text message to search within.
      */

    static getHeader (message: string) {
        let start = message.search(new RegExp(loader.definitions.expressions.ugc1, "gimu"));
        let end = message.substring(start).search(new RegExp(loader.definitions.expressions.ugc2, "gimu"));
        let full = message.substring(start, start + end).replace(/\s+/g, '').slice(0, -1);
        return full;
    }

    /**
      * @function getLocations
      * @description Retrieves location names from a database based on UGC zone codes.
      * 
      * @param {Array} zones - An array of UGC zone codes.
      */

    static async getLocations (zones: any) {
        const locations: string[] = [];
        for (let i = 0; i < zones.length; i++) {
            const id = zones[i].trim();
            const statement = `SELECT location FROM shapefiles WHERE id = ?`;
            const located = await loader.statics.db.prepare(statement).get(id);
            located != undefined ? locations.push(located.location) : locations.push(id);
        }
        return Array.from(new Set(locations)).sort();
    }

    /**
      * @function getCoordinates
      * @description Retrieves geographical coordinates from a database based on UGC zone codes.
      * 
      * @param {Array} zones - An array of UGC zone codes.
      */

    static getCoordinates (zones: any) {
        let coordinates: [number, number][] = [];
        for (let i = 0; i < zones.length; i++) {
            const id = zones[i].trim();
            const statement = `SELECT geometry FROM shapefiles WHERE id = ?`;
            let located = loader.statics.db.prepare(statement).get(id);
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
      * @function getZones
      * @description Parses the UGC header to extract individual UGC zone codes, handling ranges and formats.
      * 
      * @param {string} header - The UGC header string.
      */

    static getZones (header: string) {
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

export default mUgcParser;

