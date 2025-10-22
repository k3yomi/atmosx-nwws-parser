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

export class HVtecParser {
    
    /**
     * @function HVtecExtractor
     * @description
     *     Extracts VTEC entries from a raw NWWS message string and returns
     *     structured objects containing type, tracking, event, status,
     *     WMO identifiers, and expiry date.
     *
     * @static
     * @param {string} message
     * @returns {Promise<types.HtecEntry[] | null>}
     */
    public static async HVtecExtractor(message: string): Promise<types.HVtecEntry[] | null> {
        const matches = message.match(new RegExp(loader.definitions.expressions.hvtec, 'g'));
        if (!matches || matches.length !== 1) return null;
        const hvtec = matches[0];
        const parts = hvtec.split('.');
        if (parts.length < 7) return null;
        const hvtecs: types.HVtecEntry[] = [{
            severity: loader.definitions.severity[parts[1]],
            cause: loader.definitions.causes[parts[2]],
            record: loader.definitions.records[parts[6]],
            raw: hvtec,
        }];
        return hvtecs;
    }
}

export default HVtecParser;