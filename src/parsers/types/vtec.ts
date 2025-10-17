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

import * as types from '../../types';
import VtecParser from '../vtec';
import UgcParser from '../ugc';
import EventParser from '../events';


export class VTECAlerts {

    /**
     * event processes validated VTEC alert messages, extracting relevant information and compiling it into structured event objects.
     *
     * @public
     * @static
     * @async
     * @param {types.TypeCompiled} validated 
     * @returns {*} 
     */
    public static async event(validated: types.TypeCompiled) {
        let processed = [] as unknown[];
        const messages = validated.message.split(/(?=\$\$)/g)?.map(msg => msg.trim());
        if (!messages || messages.length == 0) return;
        for (let i = 0; i < messages.length; i++) {
            const tick = performance.now();
            const message = messages[i]
            const getVTEC = await VtecParser.vtecExtractor(message) as types.VTECParsed[];
            const getUGC = await UgcParser.ugcExtractor(message) as types.UGCParsed;
            if (getVTEC != null && getUGC != null) {
                for (let j = 0; j < getVTEC.length; j++) {
                    const vtec = getVTEC[j];
                    const getBaseProperties = await EventParser.getBaseProperties(message, validated, getUGC, vtec) as types.BaseProperties;
                    const getHeader = EventParser.getHeader({ ...validated.attributes, ...getBaseProperties.attributes } as types.TypeAttributes, getBaseProperties, vtec);
                    processed.push({
                        performance: performance.now() - tick,
                        tracking: vtec.tracking,
                        header: getHeader,
                        vtec: vtec.raw,
                        history: [{ description: getBaseProperties.description, issued: getBaseProperties.issued, type: vtec.status }],
                        properties: { event: vtec.event, parent: vtec.event, action_type: vtec.status, ...getBaseProperties, }
                    })
                }
            }
        }
        EventParser.validateEvents(processed);
    }
}

export default VTECAlerts;