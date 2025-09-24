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


export class mVtecParser {

    /**
      * @function getVTEC
      * @description Extracts VTEC information from a weather alert message.
      * 
      * @param {string} message - The full text message to search within.
      * @param {object} attributes - Additional attributes such as issue time.
      */

    static getVTEC (message: string, attributes: any) {
        const vtecs: any[] = []; // Array to hold all VTEC objects (Alerts CAN have multiple VTECs so we need to account for that)
        const matches = message.match(new RegExp(loader.definitions.expressions.vtec, 'g'));
        if (!matches) return null; // No VTEC Found
        for (let i = 0; i < matches.length; i++) {
            const vtec = matches[i];
            const parts = vtec.split(`.`);
            const dates = parts[6].split(`-`);
            vtecs.push({
                handle: vtec,
                tracking: this.getTracking(parts),
                event: this.getEventName(parts),
                status: this.getEventStatus(parts),
                wmo: message.match(new RegExp(loader.definitions.expressions.wmo, 'gimu')),
                expires: this.getEventExpires(dates),
                issued: attributes.issue
            })
        }
        return vtecs;
    }

    /**
      * @function getTracking
      * @description Constructs a tracking code from VTEC parts.
      * 
      * @param {Array} args - An array of VTEC parts.
      */

    static getTracking (args: any) {
        return `${args[2]}-${args[3]}-${args[4]}-${args[5]}`;
    }

    /**
      * @function getEventName
      * @description Constructs an event name from VTEC parts.
      * 
      * @param {Array} args - An array of VTEC parts.
      */

    static getEventName (args: any) {
        return `${loader.definitions.events[args[3]]} ${loader.definitions.actions[args[4]]}`;
    }

    /**
      * @function getEventStatus
      * @description Retrieves the event status from VTEC parts.
      * 
      * @param {Array} args - An array of VTEC parts.
      */

    static getEventStatus (args: any) {
        return loader.definitions.status[args[1]]
    }

    /**
      * @function getEventExpires
      * @description Constructs an expiration date-time string from VTEC date parts.
      * 
      * @param {Array} args - An array containing the start and end date-time strings.
      */

    static getEventExpires (args: any) {
        if (args[1] == `000000T0000Z`) return `Invalid Date Format`;
        const expires = `${new Date().getFullYear().toString().substring(0, 2)}${args[1].substring(0, 2)}-${args[1].substring(2, 4)}-${args[1].substring(4, 6)}T${args[1].substring(7, 9)}:${args[1].substring(9, 11)}:00`;
        const local = new Date(new Date(expires).getTime() - 4 * 60 * 60000);
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}:00.000-04:00`;
    }
    
}

export default mVtecParser;

