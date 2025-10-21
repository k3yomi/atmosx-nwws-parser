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
        return `${baseProperties.sender_icao}-${baseProperties.attributes.ttaaii}-${baseProperties.attributes.id.slice(-4)}`
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
     *     The raw message text to parse for event identification.
     * @param {Record<string, any>} attributes
     *     The AWIPS-related attributes, expected to include a `type` field.
     *
     * @returns {string}
     *     The derived event name, either the matched offshore event or a formatted
     *     attribute-based string.
     */
    private static getEvent(message: string, attributes: Record<string, any>) {
        const offshoreEvent = Object.keys(loader.definitions.offshore).find(event => message.toLowerCase().includes(event.toLowerCase()));
        if (offshoreEvent != undefined ) return Object.keys(loader.definitions.offshore).find(event => message.toLowerCase().includes(event.toLowerCase()));
        return attributes.type.split(`-`).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(` `)
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
     *     The validated stanza object containing message text, attributes,
     *     and metadata.
     *
     * @returns {Promise<void>}
     *     This method does not return a value. It processes events and
     *     invokes `EventParser.validateEvents` to filter and emit them.
     *
     * @remarks
     *     - Splits multi-stanza messages using `$$`, `ISSUED TIME...`, or
     *       `=================================================` as delimiters.
     *     - Extracts UGC entries using `UgcParser.ugcExtractor`.
     *     - Calls `EventParser.getBaseProperties` to compile core event properties.
     *     - Computes an EAS header using `EventParser.getHeader`.
     *     - Generates a human-readable event name via `this.getEvent`.
     *     - Computes a tracking string via `this.getTracking`.
     *     - Tracks performance timing for each processed message.
     *     - Calls `EventParser.validateEvents` to filter and emit final events.
     */
    public static async event(validated: types.StanzaCompiled) {
        let processed = [] as unknown[];
        const messages = validated.message.split(/(?=\$\$|ISSUED TIME...|=================================================)/g)?.map(msg => msg.trim());
        if (!messages || messages.length == 0) return;
        for (let i = 0; i < messages.length; i++) {
            const tick = performance.now();
            const message = messages[i]
            const getUGC = await UgcParser.ugcExtractor(message) as types.UGCEntry
            if (getUGC != null) {
                const getBaseProperties = await EventParser.getBaseProperties(message, validated, getUGC) as types.EventProperties;
                const getHeader = EventParser.getHeader({ ...validated.attributes, ...getBaseProperties.attributes } as types.StanzaAttributes, getBaseProperties);
                const getEvent = this.getEvent(message, getBaseProperties.attributes.getAwip);
                processed.push({
                    performance: performance.now() - tick,
                    source: `ugc-parser`,
                    tracking: this.getTracking(getBaseProperties),
                    header: getHeader,
                    vtec: `N/A`,
                    history: [{ description: getBaseProperties.description, issued: getBaseProperties.issued, type: `Issued` }],
                    properties: { event: getEvent, parent: getEvent, action_type: `Issued`, ...getBaseProperties, }
                })
            }
        }
        EventParser.validateEvents(processed);
    }
}

export default UGCAlerts;