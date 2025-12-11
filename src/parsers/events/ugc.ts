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
import * as loader from '../../bootstrap';
import UgcParser from '../ugc';
import EventParser from '../events';


export class UGCAlerts {

    /**
     * @function getTracking
     * @description
     *    Generates a unique tracking identifier for an event using the sender's ICAO
     *    and some attributes.
     *
     * @private
     * @static
     * @param {types.EventProperties} baseProperties 
     * @returns {string} 
     */
    private static getTracking(baseProperties: types.EventProperties) {
        return `${baseProperties.sender_icao}-${baseProperties.raw.attributes.ttaaii}-${baseProperties.raw.attributes.id.slice(-4)}`
    }

    /**
     * @function getEvent
     * @description
     *     Determines the human-readable event name from a message and AWIPS attributes.
     *     - Checks if the message contains any predefined offshore event keywords
     *       and returns the matching offshore event if found.
     *     - Otherwise, returns a formatted event type string from the provided attributes,
     *       capitalizing the first letter of each word.
     *
     * @private
     * @static
     * @param {string} message
     * @param {Record<string, any>} attributes
     * @returns {string}
     */
    private static getEvent(message: string, metadata: types.StanzaAttributes) {
        const offshoreEvent = Object.keys(loader.definitions.offshore).find(event => message.toLowerCase().includes(event.toLowerCase()));
        if (offshoreEvent != undefined ) return Object.keys(loader.definitions.offshore).find(event => message.toLowerCase().includes(event.toLowerCase()));
        return metadata.awipsType.type.split(`-`).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(` `)
    }

    /**
     * @function event
     * @description
     *     Processes a validated stanza message, extracting UGC entries and
     *     computing base properties for non-VTEC events. Each extracted event
     *     is enriched with metadata, performance timing, and history information,
     *     then filtered and emitted via `EventParser.validateEvents`.
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
                const getUGC = await UgcParser.ugcExtractor(message) as types.UGCEntry
                if (getUGC != null) {
                    const attributes = cachedAttribute != null ? JSON.parse(cachedAttribute[1]) : validated;
                    const baseProperties = await EventParser.getBaseProperties(message, attributes, getUGC) as types.EventProperties;
                    const getHeader = EventParser.getHeader({ ...attributes, ...baseProperties.raw } as types.StanzaAttributes, baseProperties);
                    const getEvent = this.getEvent(message, attributes);
                    processed.push({
                        type: "Feature",
                        properties: { event: getEvent, parent: getEvent, action_type: `Issued`, ...baseProperties, },
                        details: {
                            performance: performance.now() - tick,
                            source: `ugc-parser`,
                            tracking: this.getTracking(baseProperties),
                            header: getHeader,
                            pvtec: `N/A`,
                            hvtec: `N/A`,
                            history: [{ description: baseProperties.description, issued: baseProperties.issued, type: `Issued` }],
                        }
                    })
                }
            }
        }
        EventParser.validateEvents(processed);
    }
}

export default UGCAlerts;