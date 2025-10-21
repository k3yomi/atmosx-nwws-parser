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

export class VtecParser {
    
    /**
     * @function vtecExtractor
     * @description
     *     Extracts VTEC entries from a raw NWWS message string and returns
     *     structured objects containing type, tracking, event, status,
     *     WMO identifiers, and expiry date.
     *
     * @static
     * @param {string} message
     *     The raw message string potentially containing one or more VTEC codes.
     *
     * @returns {Promise<types.VtecEntry[] | null>}
     *     Resolves with an array of VTEC entry objects if any are found,
     *     otherwise resolves with `null`.
     */
    public static async vtecExtractor(message: string): Promise<types.VtecEntry[] | null> {
        const matches = message.match(new RegExp(loader.definitions.expressions.vtec, 'g'));
        if (!matches) return null;
        const vtecs: types.VtecEntry[] = [];
        for (const vtec of matches) {
            const parts = vtec.split('.');
            if (parts.length < 7) continue; 
            const dates = parts[6].split('-');
            vtecs.push({
                raw: vtec,
                type: loader.definitions.productTypes[parts[0]],
                tracking: `${parts[2]}-${parts[3]}-${parts[4]}-${parts[5]}`,
                event: `${loader.definitions.events[parts[3]]} ${loader.definitions.actions[parts[4]]}`,
                status: loader.definitions.status[parts[1]],
                wmo: message.match(new RegExp(loader.definitions.expressions.wmo, 'gimu')) ?? [],
                expires: this.parseExpiryDate(dates),
            });
        }
        return vtecs.length ? vtecs : null;
    }

    /**
     * @function parseExpiryDate
     * @description
     *     Converts a NWWS VTEC/expiry timestamp string into a formatted local ISO date string
     *     with an Eastern Time offset (-04:00). Returns `Invalid Date Format` if the input
     *     is `000000T0000Z`.
     *
     * @private
     * @static
     * @param {string[]} args
     *     The arguments array where `args[1]` is expected to be the expiry timestamp
     *     in VTEC format.
     * 
     * @returns {string}
     *     The formatted expiry date string in local time with `-04:00` offset, or
     *     `Invalid Date Format` if the input is invalid.
     */
    private static parseExpiryDate(args: String[]): string {
        if (args[1] == `000000T0000Z`) return `Invalid Date Format`;
        const expires = `${new Date().getFullYear().toString().substring(0, 2)}${args[1].substring(0, 2)}-${args[1].substring(2, 4)}-${args[1].substring(4, 6)}T${args[1].substring(7, 9)}:${args[1].substring(9, 11)}:00`;
        const local = new Date(new Date(expires).getTime() - 4 * 60 * 60000);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}:00.000-04:00`;
    }
}

export default VtecParser;