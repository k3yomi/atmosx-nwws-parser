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
import EventParser from '../events';


export class TextAlerts {

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
    private static getTracking(properties: types.EventProperties) {
        return `${properties.sender_icao}-${properties.raw.attributes.ttaaii}-${properties.raw.attributes.id.slice(-4)}`
    }

    /**
     * @function getEvent
     * @description
     *     Determines the event name from a text message and its AWIPS attributes.
     *     If the message contains a known offshore event keyword, that offshore
     *     event is returned. Otherwise, the event type from the AWIPS attributes
     *     is formatted into a human-readable string with each word capitalized.
     *
     * @private
     * @static
     * @param {string} message
     * @param {types.StanzaAttributes} metadata
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
     *     Processes a compiled text-based NOAA Stanza message and extracts relevant
     *     event information. Splits the message into multiple segments based on
     *     markers such as "$$", "ISSUED TIME...", or separator lines, generates
     *     base properties, headers, event names, and tracking information for
     *     each segment, then validates and emits the processed events.
     *
     * @public
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
                const baseProperties = await EventParser.getBaseProperties(message, attributes) as types.EventProperties;
                const getHeader = EventParser.getHeader({ ...validated.attributes, ...baseProperties.raw } as types.StanzaAttributes, baseProperties)
                const getEvent = this.getEvent(message, attributes);
                processed.push({
                    properties: { event: getEvent, parent: getEvent, action_type: `Issued`, ...baseProperties },
                    details: {
                        type: "Feature",
                        performance: performance.now() - tick,
                        source: `text-parser`,
                        tracking: this.getTracking(baseProperties),
                        header: getHeader,
                        pvtec: `N/A`,
                        hvtec: `N/A`,
                        history: [{ description: baseProperties.description, issued: baseProperties.issued, type: `Issued` }],
                    },
                })
            }
        }
        EventParser.validateEvents(processed);
    }
}

export default TextAlerts;