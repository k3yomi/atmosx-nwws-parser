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
     * Generates a tracking identifier based on the sender's ICAO code.
     *
     * @private
     * @static
     * @param {types.BaseProperties} baseProperties
     * @returns {string}
     */
    private static getTracking(baseProperties: types.BaseProperties) {
        return `${baseProperties.sender_icao}`
    }

    /**
     * Determines the event type based on the message content and provided attributes.
     *
     * @private
     * @static
     * @param {string} message
     * @param {Record<string, any>} attributes
     * @returns {*}
     */
    private static getEvent(message: string, attributes: Record<string, any>) {
        const offshoreEvent = Object.keys(loader.definitions.offshore).find(event => message.toLowerCase().includes(event.toLowerCase()));
        if (offshoreEvent) return Object.keys(loader.definitions.offshore).find(event => message.toLowerCase().includes(event.toLowerCase()));
        return attributes.type.split(`-`).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(` `)
    }
    
    /**
     * event processes validated UGC alert messages, extracting relevant information and compiling it into structured event objects.
     *
     * @public
     * @static
     * @async
     * @param {types.TypeCompiled} validated 
     * @returns {*} 
     */
    public static async event(validated: types.TypeCompiled) {
        let processed = [] as unknown[];
        const messages = validated.message.split(/(?=\$\$|ISSUED TIME...|=================================================)/g)?.map(msg => msg.trim());
        if (!messages || messages.length == 0) return;
        for (let i = 0; i < messages.length; i++) {
            const tick = performance.now();
            const message = messages[i]
            const getBaseProperties = await EventParser.getBaseProperties(message, validated) as types.BaseProperties;
            const getHeader = EventParser.getHeader({ ...validated.attributes, ...getBaseProperties.attributes } as types.TypeAttributes, getBaseProperties);
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