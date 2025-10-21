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
     * @function event
     * @description
     *     Processes a validated stanza message, extracting VTEC and UGC entries,
     *     computing base properties, generating headers, and preparing structured
     *     event objects for downstream handling. Each extracted event is enriched
     *     with metadata, performance timing, and history information.
     *
     * @static
     * @async
     * @param {types.StanzaCompiled} validated
     *     The validated stanza object containing message text, attributes,
     *     and metadata.
     *
     * @returns {Promise<void>}
     *     This method does not return a value. It processes events and
     *     invokes `EventParser.validateEvents` to filter and emit them.
     *
     * @remarks
     *     - Splits multi-stanza messages using `$$` as a delimiter.
     *     - Extracts VTEC entries using `VtecParser.vtecExtractor`.
     *     - Extracts UGC entries using `UgcParser.ugcExtractor`.
     *     - Calls `EventParser.getBaseProperties` to compile core event properties.
     *     - Computes an EAS header using `EventParser.getHeader`.
     *     - Tracks performance timing for each processed message.
     *     - Calls `EventParser.validateEvents` to filter and emit final events.
     */
    public static async event(validated: types.StanzaCompiled) {
        let processed = [] as unknown[];
        const messages = validated.message.split(/(?=\$\$)/g)?.map(msg => msg.trim());
        if (!messages || messages.length == 0) return;
        for (let i = 0; i < messages.length; i++) {
            const tick = performance.now();
            const message = messages[i]
            const getVTEC = await VtecParser.vtecExtractor(message) as types.VtecEntry[]
            const getUGC = await UgcParser.ugcExtractor(message) as types.UGCEntry
            if (getVTEC != null && getUGC != null) {
                for (let j = 0; j < getVTEC.length; j++) {
                    const vtec = getVTEC[j];
                    const getBaseProperties = await EventParser.getBaseProperties(message, validated, getUGC, vtec) as types.EventProperties;
                    const getHeader = EventParser.getHeader({ ...validated.attributes, ...getBaseProperties.attributes } as types.StanzaAttributes, getBaseProperties, vtec);
                    processed.push({
                        performance: performance.now() - tick,
                        source: `vtec-parser`,
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