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

export class VtecParser {

    /**
     * vtecExtractor extracts and parses VTEC codes from a given message string.
     *
     * @public
     * @static
     * @async
     * @param {string} message 
     * @returns {unknown} 
     */
    public static async vtecExtractor(message: string) {
        const vtecs: unknown[] = [];
        const matches = message.match(new RegExp(loader.definitions.expressions.vtec, 'g'));
        if (!matches) return null;
        for (let i = 0; i < matches.length; i++) {
            const vtec = matches[i];
            const parts = vtec.split(`.`);
            const dates = parts[6].split(`-`);
            vtecs.push({
                raw: vtec,
                type: loader.definitions.productTypes[parts[0]],
                tracking: `${parts[2]}-${parts[3]}-${parts[4]}-${parts[5]}`,
                event: `${loader.definitions.events[parts[3]]} ${loader.definitions.actions[parts[4]]}`,
                status: loader.definitions.status[parts[1]],
                wmo: message.match(new RegExp(loader.definitions.expressions.wmo, 'gimu')),
                expires: this.parseExpiryDate(dates)
            })
        }
        return vtecs;
    }

    /**
     * parseExpiryDate converts VTEC expiry date format to a standard ISO 8601 format with timezone adjustment.
     *
     * @private
     * @static
     * @param {String[]} args 
     * @returns {string} 
     */
    private static parseExpiryDate(args: String[]) {
        if (args[1] == `000000T0000Z`) return `Invalid Date Format`;
        const expires = `${new Date().getFullYear().toString().substring(0, 2)}${args[1].substring(0, 2)}-${args[1].substring(2, 4)}-${args[1].substring(4, 6)}T${args[1].substring(7, 9)}:${args[1].substring(9, 11)}:00`;
        const local = new Date(new Date(expires).getTime() - 4 * 60 * 60000);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}:00.000-04:00`;
    }

}

export default VtecParser;