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

    private static getTracking(extracted: Record<string, string>) {
        return extracted.vtec ? (() => {
            const vtecValue = Array.isArray(extracted.vtec) ? extracted.vtec[0] : extracted.vtec;
            const splitVTEC = vtecValue.split('.');
            return `${splitVTEC[2]}-${splitVTEC[3]}-${splitVTEC[4]}-${splitVTEC[5]}`;
        })() : `${extracted.wmoidentifier} (${extracted.ugc})`;
    }
    
    private static getICAO(vtec: string) {
        const icao = vtec ? vtec.split(`.`)[2] : `N/A`;
        const name = loader.definitions.ICAO?.[icao] ?? `N/A`;
        return { icao, name };
    }

    public static async event(validated: types.TypeCompiled) {
        let processed = [] as unknown[];
        const messages = Object.values(JSON.parse(validated.message).features) as types.TypeAlert[];
        for (let feature of messages) {
            const tick = performance.now();
            const getVTEC = feature?.properties?.parameters?.VTEC?.[0] ?? null;
            const getWmo = feature?.properties?.parameters?.WMOidentifier[0] ?? null;
            const getUgc = feature?.properties?.geocode?.UGC ?? null;
            const getHeadline = feature?.properties?.parameters?.NWSheadline?.[0] ?? "";
            const getDescription = `${getHeadline} ${feature?.properties?.description ?? ``}`
            const getAWIP = feature?.properties?.parameters?.AWIPSidentifier?.[0] ?? null;
            const getHeader = EventParser.getHeader({ ...{ getAwip: {prefix: getAWIP?.slice(0, -3) }},} as types.TypeAttributes);
            const getSource = TextParser.textProductToString(getDescription, `SOURCE...`, [`.`]) || `N/A`;
            const getOffice = this.getICAO(getVTEC || ``);
            processed.push({
                performance: performance.now() - tick,
                tracking: this.getTracking({ vtec: getVTEC, wmoidentifier: getWmo, ugc: getUgc ? getUgc.join(`,`) : null }),
                header: getHeader,
                vtec: getVTEC || `N/A`,
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
                            const [lon, lat] = Array.isArray(coord) ? coord : [0, 0];
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