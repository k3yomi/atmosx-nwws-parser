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
import pVtecParser from '../pvtec';
import hVtecParser from '../hvtec';
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
     * @returns {Promise<void>}
     */
    public static async event(validated: types.StanzaCompiled) {
        let processed = [] as unknown[];
        const blocks = validated.message.split(/\[SoF\]/gim)?.map(msg => msg.trim());
        for (const block of blocks) {
            const cachedAttribute = block.match(/STANZA ATTRIBUTES\.\.\.(\{.*\})/);
            const messages = block.split(/(?=\$\$)/g)?.map(msg => msg.trim());
            if (!messages || messages.length == 0) return;
            for (let i = 0; i < messages.length; i++) {
                const tick = performance.now();
                const message = messages[i]
                const attributes = cachedAttribute != null ? JSON.parse(cachedAttribute[1]) : validated;
                const getPVTEC = await pVtecParser.pVtecExtractor(message) as types.PVtecEntry[]
                const getHVTEC = await hVtecParser.HVtecExtractor(message) as types.HVtecEntry
                const getUGC = await UgcParser.ugcExtractor(message) as types.UGCEntry
                if (getPVTEC != null && getUGC != null) {
                    for (let j = 0; j < getPVTEC.length; j++) {
                        const pVtec = getPVTEC[j];
                        const getBaseProperties = await EventParser.getBaseProperties(message, attributes, getUGC, pVtec, getHVTEC) as types.EventProperties;
                        const getHeader = EventParser.getHeader({ ...validated.attributes, ...getBaseProperties.metadata } as types.StanzaAttributes, getBaseProperties, pVtec);
                        processed.push({
                            performance: performance.now() - tick,
                            source: `pvtec-parser`,
                            tracking: pVtec.tracking,
                            header: getHeader,
                            pvtec: pVtec.raw,
                            hvtec: getHVTEC != null ? getHVTEC.raw : `N/A`,
                            history: [{ description: getBaseProperties.description, issued: getBaseProperties.issued, type: pVtec.status }],
                            properties: { event: pVtec.event, parent: pVtec.event, action_type: pVtec.status, ...getBaseProperties, }
                        })
                    }
                }
            }
        }
        EventParser.validateEvents(processed);
    }
}

export default VTECAlerts;