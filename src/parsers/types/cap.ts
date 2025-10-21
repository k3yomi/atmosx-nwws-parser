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
import TextParser from '../text';


export class CapAlerts {
    
    /**
     * @function getTracking
     * @description
     *   Generates a unique tracking identifier for a CAP alert based on extracted XML values.
     *   If VTEC information is available, it constructs the tracking ID from the VTEC components.
     *   Otherwise, it uses the WMO identifier along with TTAI and CCCC attributes.
     *
     * @private
     * @static
     * @param {Record<string, string>} extracted 
     * @returns {string} 
     */
    private static getTracking(extracted: Record<string, string>, attributes: types.StanzaAttributes) {
        return extracted.vtec ? (() => {
            const vtecValue = Array.isArray(extracted.vtec) ? extracted.vtec[0] : extracted.vtec;
            const splitVTEC = vtecValue.split('.');
            return `${splitVTEC[2]}-${splitVTEC[3]}-${splitVTEC[4]}-${splitVTEC[5]}`;
        })() : `${extracted.wmoidentifier.substring(extracted.wmoidentifier.length - 4)}-${attributes.ttaaii}-${attributes.id.slice(-4)}`;
    }

    /**
     * @function event
     * @description
     *    Processes validated CAP alert messages, extracting relevant information and compiling it into structured event objects.   
     *
     * @public
     * @static
     * @async
     * @param {types.StanzaCompiled} validated 
     * @returns {*} 
     */
    public static async event(validated: types.StanzaCompiled) {
        let processed = [] as unknown[];
        const messages = validated.message.match(/<\?xml[\s\S]*?ISSUED TIME.../g)?.map(msg => msg.trim());
        if (messages == null || messages.length === 0) return;
        for (let message of messages) {
            const tick = performance.now();
            const attributes = TextParser.textProductToString(message, `STANZA ATTRIBUTES...`) ? JSON.parse(TextParser.textProductToString(message, `STANZA ATTRIBUTES...`)) : null
            message = message.substring(message.indexOf(`<?xml version="1.0"`), message.lastIndexOf(`>`) + 1);
            const parser = new loader.packages.xml2js.Parser({ explicitArray: false, mergeAttrs: true, trim: true })
            const parsed = await parser.parseStringPromise(message);
            if (parsed == null || parsed.alert == null) continue;
            const extracted = TextParser.getXmlValues(parsed, [
                `vtec`, `wmoidentifier`, `ugc`, `areadesc`, 
                `expires`, `sent`, `msgtype`, `description`,
                `event`, `sendername`, `tornadodetection`, `polygon`,
                `maxHailSize`, `maxWindGust`, `thunderstormdamagethreat`,
                `tornadodamagethreat`, `waterspoutdetection`, `flooddetection`,
            ]);
            const getHeader = EventParser.getHeader({ ...validated.attributes,} as types.StanzaAttributes);
            const getSource = TextParser.textProductToString(extracted.description, `SOURCE...`, [`.`]) || `N/A`;
            processed.push({
                performance: performance.now() - tick,
                source: `cap-parser`,
                tracking: this.getTracking(extracted, attributes),
                header: getHeader,
                vtec: extracted.vtec || `N/A`,
                history: [{ description: extracted.description || `N/A`, issued: extracted.sent ? new Date(extracted.sent).toLocaleString() : `N/A`, type: extracted.msgtype || `N/A` }],
                properties: {
                    locations: extracted.areadesc || `N/A`,
                    event: extracted.event || `N/A`,
                    issued: extracted.sent ? new Date(extracted.sent).toLocaleString() : `N/A`,
                    expires: extracted.expires ? new Date(extracted.expires).toLocaleString() : `N/A`,
                    parent: extracted.event || `N/A`,
                    action_type: extracted.msgtype || `N/A`,
                    description: extracted.description || `N/A`,
                    sender_name: extracted.sendername || `N/A`,
                    sender_icao: extracted.wmoidentifier ? extracted.wmoidentifier.substring(extracted.wmoidentifier.length - 4) : `N/A`,
                    attributes: validated.attributes,
                    geocode: {
                        UGC: [extracted.ugc],
                    },
                    parameters: {
                        wmo: extracted.wmoidentifier || `N/A`,
                        source: getSource,
                        max_hail_size: extracted.maxHailSize || `N/A`,
                        max_wind_gust: extracted.maxWindGust || `N/A`,
                        damage_threat: extracted.thunderstormdamagethreat || `N/A`,
                        tornado_detection: extracted.tornadodetection || extracted.waterspoutdetection || `N/A`,
                        flood_detection: extracted.flooddetection || `N/A`,
                        discussion_tornado_intensity: `N/A`,
                        discussion_wind_intensity: `N/A`,
                        discussion_hail_intensity: `N/A`,
                    },
                    geometry: extracted.polygon ? { 
                        type: `Polygon`, 
                        coordinates: extracted.polygon.split(` `).map((coord: string) => {
                            const [lat, lon] = coord.split(`,`).map((num: string) => parseFloat(num));
                            return [lat, lon];
                        }) 
                    } : null,
                }
            })
        }
        EventParser.validateEvents(processed);
    }
}

export default CapAlerts;