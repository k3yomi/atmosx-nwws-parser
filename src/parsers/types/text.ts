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
        return `${baseProperties.sender_icao}-${baseProperties.attributes.ttaaii}-${baseProperties.attributes.id.slice(-4)}`
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
     *     The raw text of the message to parse for event information.
     * @param {Record<string, any>} attributes
     *     The AWIPS attributes associated with the message, typically containing
     *     the `type` property.
     *
     * @returns {string}
     *     The determined event name, either an offshore event or formatted
     *     AWIPS type.
     */
    private static getEvent(message: string, attributes: Record<string, any>) {
        const offshoreEvent = Object.keys(loader.definitions.offshore).find(event => message.toLowerCase().includes(event.toLowerCase()));
        if (offshoreEvent) return Object.keys(loader.definitions.offshore).find(event => message.toLowerCase().includes(event.toLowerCase()));
        return attributes.type.split(`-`).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(` `)
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
     *     The validated compiled stanza object containing the original message
     *     and its attributes.
     *
     * @returns {Promise<void>}
     *     Resolves after all segments of the message have been processed and
     *     events have been validated and emitted.
     */
    public static async event(validated: types.StanzaCompiled) {
        let processed = [] as unknown[];
        const messages = validated.message.split(/(?=\$\$|ISSUED TIME...|=================================================)/g)?.map(msg => msg.trim());
        if (!messages || messages.length == 0) return;
        for (let i = 0; i < messages.length; i++) {
            const tick = performance.now();
            const message = messages[i]
            const getBaseProperties = await EventParser.getBaseProperties(message, validated) as types.EventProperties;
            const getHeader = EventParser.getHeader({ ...validated.attributes, ...getBaseProperties.attributes } as types.StanzaAttributes, getBaseProperties);
            const getEvent = this.getEvent(message, getBaseProperties.attributes.getAwip);
            processed.push({
                performance: performance.now() - tick,
                source: `text-parser`,
                tracking: this.getTracking(getBaseProperties),
                header: getHeader,
                vtec: `N/A`,
                history: [{ description: getBaseProperties.description, issued: getBaseProperties.issued, type: `Issued` }],
                properties: { event: getEvent, parent: getEvent, action_type: `Issued`, ...getBaseProperties, }
            })
        }
        EventParser.validateEvents(processed);
    }
}

export default UGCAlerts;