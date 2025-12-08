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


export class APIAlerts {
    
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
    private static getTracking(extracted: Record<string, string>) {
        return extracted.pVtec ? (() => {
            const vtecValue = Array.isArray(extracted.pVtec) ? extracted.pVtec[0] : extracted.pVtec;
            const splitPVTEC = vtecValue.split('.');
            return `${splitPVTEC[2]}-${splitPVTEC[3]}-${splitPVTEC[4]}-${splitPVTEC[5]}`;
        })() : (() => {
            const wmoMatch = extracted.wmoidentifier?.match(/([A-Z]{4}\d{2})\s+([A-Z]{4})/);
            const id = wmoMatch?.[1] || 'N/A';
            const station = wmoMatch?.[2] || 'N/A';
            return `${station}-${id}`;
        })();
    }

    /**
     * @function getICAO
     * @description
     *    Extracts the sender's ICAO code and corresponding name from a VTEC string.    
     *
     * @private
     * @static
     * @param {string} pVtec 
     * @returns {{ icao: any; name: any; }} 
     */
    private static getICAO(pVtec: string) {
        const icao = pVtec ? pVtec.split(`.`)[2] : `N/A`;
        const name = loader.definitions.ICAO?.[icao] ?? `N/A`;
        return { icao, name };
    }
    
    /**
     * @function event
     * @description
     *   Processes validated API alert messages, extracting relevant information and compiling it into structured event objects.
     *
     * @public
     * @static
     * @async
     * @param {types.StanzaCompiled} validated 
     * @returns {*} 
     */
    public static async event(validated: types.StanzaCompiled) {
        let processed = [] as unknown[];
        const messages = Object.values(JSON.parse(validated.message).features) as types.EventCompiled[];
        for (let feature of messages) {
            const tick = performance.now();
            const getPVTEC = feature?.properties?.parameters?.VTEC?.[0] ?? null;
            const getWmo = feature?.properties?.parameters?.WMOidentifier?.[0] ?? null;
            const getUgc = feature?.properties?.geocode?.UGC ?? null;
            const getHeadline = feature?.properties?.parameters?.NWSheadline?.[0] ?? "";
            const getDescription = `${getHeadline} ${feature?.properties?.description ?? ``}`
            const getAWIP = feature?.properties?.parameters?.AWIPSidentifier?.[0] ?? null;
            const getHeader = EventParser.getHeader({ ...{ getAwip: {prefix: getAWIP?.slice(0, -3) }},} as types.StanzaAttributes);
            const getSource = TextParser.textProductToString(getDescription, `SOURCE...`, [`.`]) || `N/A`;
            const getOffice = this.getICAO(getPVTEC || ``);
            processed.push({
                performance: performance.now() - tick,
                source: `api-parser`,
                tracking: this.getTracking({ pVtec: getPVTEC, wmoidentifier: getWmo, ugc: getUgc ? getUgc.join(`,`) : null }),
                header: getHeader,
                pvtec: getPVTEC || `N/A`,
                history: [{
                    description: feature?.properties?.description ?? `N/A`,
                    action: feature?.properties?.messageType ?? `N/A`,
                    time: feature?.properties?.sent ? new Date(feature?.properties?.sent).toLocaleString() : `N/A`
                }],
                properties: {
                    locations: feature?.properties?.areaDesc ?? `N/A`,
                    event: feature?.properties?.event ?? `N/A`,
                    issued: feature?.properties?.sent ? new Date(feature?.properties?.sent).toLocaleString() : `N/A`,
                    expires: feature?.properties?.expires ? new Date(feature?.properties?.expires).toLocaleString() : `N/A`,
                    parent: feature?.properties?.event ?? `N/A`,
                    action_type: feature?.properties?.messageType ?? `N/A`,
                    description: feature?.properties?.description ?? `N/A`,
                    sender_name: getOffice.name || `N/A`,
                    sender_icao: getOffice.icao || `N/A`,
                    attributes: validated.attributes,
                    geocode: {
                        UGC: feature?.properties?.geocode?.UGC ?? [`XX000`]
                    },
                    metadata: {},
                    technical: {
                        vtec: getPVTEC || `N/A`,
                        ugc: getUgc ? getUgc.join(`,`) : `N/A`,
                        hvtec: `N/A`,
                    },
                    parameters: {
                        wmo: feature?.properties?.parameters?.WMOidentifier?.[0] || getWmo || `N/A`,
                        source: getSource,
                        max_hail_size: feature?.properties?.parameters?.maxHailSize || `N/A`,
                        max_wind_gust: feature?.properties?.parameters?.maxWindGust || `N/A`,
                        damage_threat: feature?.properties?.parameters?.thunderstormDamageThreat || [`N/A`],
                        tornado_detection: feature?.properties?.parameters?.tornadoDetection || [`N/A`],
                        flood_detection: feature?.properties?.parameters?.floodDetection || [`N/A`],
                        discussion_tornado_intensity: "N/A", 
                        peakWindGust: `N/A`,
                        peakHailSize: `N/A`,
                    },
                    geometry: feature?.geometry?.coordinates?.[0]?.length ? {
                        type: feature?.geometry?.type || 'Polygon',
                        coordinates: feature?.geometry?.coordinates?.[0]?.map((coord: number) => {
                            const [lat, lon] = Array.isArray(coord) ? coord : [0, 0];
                            return [lon, lat]; 
                        })
                    } : null
                }
            })
        }
        EventParser.validateEvents(processed);
    }
}

export default APIAlerts;