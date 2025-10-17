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

import * as loader from '../bootstrap';
import * as types from '../types';
import TextParser from './text';
import UGCParser from './ugc';
import VTECAlerts from './types/vtec';
import UGCAlerts from './types/ugc';
import TextAlerts from './types/text';
import CAPAlerts from './types/cap';
import APIAlerts from './types/api';


import EAS from '../eas';

export class EventParser {

    
    /**
     * getBaseProperties extracts and compiles the base properties of an alert message, including location, timing, description, sender information, and various parameters.
     *
     * @public
     * @static
     * @async
     * @param {string} message 
     * @param {types.TypeCompiled} validated 
     * @param {types.UGCParsed} [ugc=null] 
     * @param {types.VTECParsed} [vtec=null] 
     * @returns {Promise<types.BaseProperties>} 
     */
    public static async getBaseProperties(message: string, validated: types.TypeCompiled, ugc: types.UGCParsed = null, vtec: types.VTECParsed = null): Promise<types.BaseProperties> {
        const settings = loader.settings as types.ClientSettings;
        const definitions = {
            tornado: TextParser.textProductToString(message, `TORNADO...`) || TextParser.textProductToString(message, `WATERSPOUT...`) || `N/A`,
            hail: TextParser.textProductToString(message, `MAX HAIL SIZE...`, [`IN`]) || TextParser.textProductToString(message, `HAIL...`, [`IN`]) || `N/A`,
            gusts: TextParser.textProductToString(message, `MAX WIND GUST...`) || TextParser.textProductToString(message, `WIND...`) || `N/A`,
            flood: TextParser.textProductToString(message, `FLASH FLOOD...`) || `N/A`,
            damage: TextParser.textProductToString(message, `DAMAGE THREAT...`) || `N/A`,
            source: TextParser.textProductToString(message, `SOURCE...`, [`.`]) || `N/A`,
            attributes: TextParser.textProductToString(message, `STANZA ATTRIBUTES...`) ? JSON.parse(TextParser.textProductToString(message, `STANZA ATTRIBUTES...`)) : null,
            polygon: TextParser.textProductToPolygon(message),
            description: TextParser.textProductToDescription(message, vtec?.raw ?? null),
            wmo: message.match(new RegExp(loader.definitions.expressions.wmo, 'imu')),
            mdTorIntensity: TextParser.textProductToString(message, `MOST PROBABLE PEAK TORNADO INTENSITY...`) || `N/A`,
            mdWindGusts: TextParser.textProductToString(message, `MOST PROBABLE PEAK WIND GUST...`) || `N/A`,
            mdHailSize: TextParser.textProductToString(message, `MOST PROBABLE PEAK HAIL SIZE...`) || `N/A`,
        };
        const getOffice = this.getICAO(vtec, validated.attributes ?? definitions.attributes ?? {}, definitions.wmo);
        const getCorrectIssued = this.getCorrectIssuedDate(definitions.attributes ?? validated.attributes  ?? {});
        const getCorrectExpiry = this.getCorrectExpiryDate(vtec, ugc);
        const getAwip = TextParser.awipTextToEvent(definitions.attributes?.awipsid ?? validated.awipsType.prefix);
        const base = { 
            locations: ugc?.locations.join(`; `) || `No Location Specified (UGC Missing)`,
            issued: getCorrectIssued,
            expires: getCorrectExpiry,
            geocode: { UGC: ugc?.zones || [`XX000`] },
            description: definitions.description,
            sender_name: getOffice.name,
            sender_icao: getOffice.icao,
            attributes: {
                ...validated.attributes,
                ...definitions.attributes,
                getAwip,
            },
            parameters: {
                wmo: Array.isArray(definitions.wmo) ? definitions.wmo[0] : (definitions.wmo ?? `N/A`),
                source: definitions.source,
                max_hail_size: definitions.hail,
                max_wind_gust: definitions.gusts,
                damage_threat: definitions.damage,
                tornado_detection: definitions.tornado,
                flood_detection: definitions.flood,
                discussion_tornado_intensity: definitions.mdTorIntensity,
                discussion_wind_intensity: definitions.mdWindGusts,
                discussion_hail_intensity:  definitions.mdHailSize,
            },
            geometry: definitions.polygon.length > 0 ? { type: "Polygon", coordinates: definitions.polygon } : null
        };
        if (settings.NoaaWeatherWireService.alertPreferences.isShapefileUGC && base.geometry == null && ugc != null) {
            const coordinates = await UGCParser.getCoordinates(ugc.zones);
            base.geometry = { type: "Polygon", coordinates };
        }
        return base;
    }

    /**
     * enhanceEvent refines the event name based on specific conditions and tags found in the event's description and parameters.
     *
     * @public
     * @static
     * @param {types.TypeAlert} event 
     * @returns {{ eventName: any; tags: any; }} 
     */
    public static enhanceEvent(event: types.TypeAlert) {
        let eventName = event?.properties?.event ?? `Unknown Event`;
        const defEventTable = loader.definitions.enhancedEvents;
        const defEventTags = loader.definitions.tags

        const properties = event?.properties;
        const parameters = properties?.parameters;

        const description = properties?.description ?? `Unknown Description`;
        const damageThreatTag = parameters?.damage_threat ?? `N/A`;
        const tornadoThreatTag = parameters?.tornado_detection ?? `N/A`;


        for (const eventGroup of defEventTable) {
            const [baseEvent, conditions] = Object.entries(eventGroup)[0] as [string, Record<string, types.EnhancedEventCondition>];
            if (eventName === baseEvent) {
                for (const [specificEvent, condition] of Object.entries(conditions)) {
                    const conditionMet = (condition.description && description.includes(condition.description.toLowerCase())) || (condition.condition && condition.condition(damageThreatTag || tornadoThreatTag));
                    if (conditionMet) { eventName = specificEvent; break; }
                }   
                if (baseEvent === 'Severe Thunderstorm Warning' && damageThreatTag === 'POSSIBLE' && !eventName.includes('(TPROB)')) eventName += ' (TPROB)';
                break;
            }
        }
        const tags = Object.entries(defEventTags).filter(([key]) => description.includes(key.toLowerCase())).map(([, value]) => value)
        return { eventName, tags: tags.length > 0 ? tags : [`N/A`] }
    }
    
    /**
     * getCorrectExpiryDate determines the correct expiration date for an alert based on VTEC information or UGC zones.
     *
     * @public
     * @static
     * @param {unknown[]} events 
     */
    public static validateEvents(events: unknown[]) {
        if (events.length == 0) return;

        const settings = loader.settings as types.ClientSettings;
        const filteringSettings = loader.settings?.global?.alertFiltering;
        const easSettings = loader.settings?.global?.easSettings;
        const globalSettings = loader.settings?.global;
        const sets = {} as Record<string, Set<string>>;
        const bools = {} as Record<string, boolean>;
        const megered = {...filteringSettings, ...easSettings, ...globalSettings};

        for (const key in megered) {
            const setting = megered[key];
            if (Array.isArray(setting)) { sets[key] = new Set(setting.map(item => item.toLowerCase())); }
            if (typeof setting === 'boolean') { bools[key] = setting; }
        }

        const filtered = events.filter((alert: any) => {
            const originalEvent = alert
            const props = originalEvent?.properties;
            const ugcs = props?.geocode?.UGC ?? [];
            if (bools?.betterEventParsing) {
                const { eventName, tags } = this.enhanceEvent(originalEvent);
                originalEvent.properties.event = eventName;
                originalEvent.properties.tags = tags;
            }
            const eventCheck = bools?.useParentEvents ? props.parent?.toLowerCase() : props.event?.toLowerCase();
            const statusCorrelation = loader.definitions.correlations.find((c: { type: string }) => c.type === originalEvent.properties.action_type);
            for (const key in sets) {
                const setting = sets[key];
                if (key === 'filteredEvents' && setting.size > 0 && eventCheck != null && !setting.has(eventCheck)) return false;
                if (key === 'ignoredEvents' && setting.size > 0 && eventCheck != null && setting.has(eventCheck)) return false;
                if (key === 'filteredICOAs' && setting.size > 0 && props.sender_icao != null && !setting.has(props.sender_icao.toLowerCase())) return false;
                if (key === 'ignoredICOAs' && setting.size > 0 && props.sender_icao != null && setting.has(props.sender_icao.toLowerCase())) return false;
                if (key === 'ugcFilter' && setting.size > 0 && ugcs.length > 0 && !ugcs.some((ugc: string) => setting.has(ugc.toLowerCase()))) return false;
                if (key === 'stateFilter' && setting.size > 0 && ugcs.length > 0 && !ugcs.some((ugc: string) => setting.has(ugc.substring(0, 2).toLowerCase()))) return false;
                if (key === 'easAlerts' && setting.size > 0 && eventCheck != null && setting.has(eventCheck) && settings.isNWWS) { EAS.generateEASAudio(props.description, alert.header) }
            }
            for (const key in bools) {
                const setting = bools[key];
                if (key === 'checkExpired' && setting && new Date(props?.expires).getTime() < new Date().getTime()) return false;   
            }
            originalEvent.properties.action_type = statusCorrelation ? statusCorrelation.forward : originalEvent.properties.action_type;
            originalEvent.properties.is_updated = statusCorrelation ? (statusCorrelation.update == true && bools.checkExpired) : false;
            originalEvent.properties.is_issued = statusCorrelation ? (statusCorrelation.new == true && bools.checkExpired) : false;
            originalEvent.properties.is_cancelled = statusCorrelation ? (statusCorrelation.cancel == true && bools.checkExpired) : false;
            const { performance, header, ...eventWithoutPerformance } = originalEvent;
            originalEvent.hash = loader.packages.crypto.createHash('md5').update(JSON.stringify(eventWithoutPerformance)).digest('hex');
            if (props.description) { 
                const detectedPhrase = loader.definitions.cancelSignatures.find(sig => props.description.toLowerCase().includes(sig.toLowerCase()));
                if (detectedPhrase && bools.checkExpired) { originalEvent.properties.action_type = 'Cancel'; originalEvent.properties.is_cancelled = true; return false; } 
            }
            if (originalEvent.vtec) { 
                const getType = originalEvent.vtec.split(`.`)[0];
                const isTestProduct = loader.definitions.productTypes[getType] == `Test Product`
                if (isTestProduct) { return false; }
            }
            loader.cache.events.emit(`on${originalEvent.properties.parent.replace(/\s+/g, '')}`)
            return true;
        })
        if (filtered.length > 0) { loader.cache.events.emit(`onAlerts`, filtered); }
    }

    /**
     * getHeader constructs a standardized alert header string based on provided attributes, properties, and VTEC information.
     *
     * @public
     * @static
     * @param {types.TypeAttributes} attributes 
     * @param {?types.BaseProperties} [properties] 
     * @param {?types.VTECParsed} [vtec] 
     * @returns {string} 
     */
    public static getHeader(attributes: types.TypeAttributes, properties?: types.BaseProperties, vtec?: types.VTECParsed) {
        const parent = `ATSX`
        const alertType = attributes?.awipsType?.type ?? attributes?.getAwip?.prefix ?? `XX`;
        const ugc = properties?.geocode?.UGC != null ? properties?.geocode?.UGC.join(`-`) : `000000`;
        const status = vtec?.status || 'Issued';
        const issued = properties?.issued != null ? new Date(properties?.issued)?.toISOString().replace(/[-:]/g, '').split('.')[0] : new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
        const sender = properties?.sender_icao || `XXXX`;
        const header = `ZCZC-${parent}-${alertType}-${ugc}-${status}-${issued}-${sender}-`;
        return header
    }
    
    /**
     * eventHandler routes the validated alert message to the appropriate event parser based on its type (API, CAP, VTEC, UGC, or plain text).
     *
     * @public
     * @static
     * @param {types.TypeCompiled} validated 
     * @returns {*} 
     */
    public static eventHandler(validated: types.TypeCompiled) {
        if (validated.isApi) return APIAlerts.event(validated)
        if (validated.isCap) return CAPAlerts.event(validated)
        if (!validated.isCap && validated.isVtec && validated.isUGC) return VTECAlerts.event(validated);
        if (!validated.isCap && !validated.isVtec && validated.isUGC) return UGCAlerts.event(validated); 
        if (!validated.isCap && !validated.isVtec && !validated.isUGC) return TextAlerts.event(validated);
    }

    /**
     * getICAO retrieves the ICAO code and corresponding office name based on VTEC tracking information, message attributes, or WMO code.
     *
     * @private
     * @static
     * @param {types.VTECParsed} vtec 
     * @param {Record<string, string>} attributes 
     * @param {(RegExpMatchArray | string | null)} WMO 
     * @returns {{ icao: any; name: any; }} 
     */
    private static getICAO(vtec: types.VTECParsed, attributes: Record<string, string>, WMO: RegExpMatchArray | string | null) {
        const icao = vtec != null ? vtec?.tracking.split(`-`)[0] : (attributes?.cccc ?? (WMO != null ? (Array.isArray(WMO) ? WMO[0] : WMO) : `N/A`));
        const name = loader.definitions.ICAO?.[icao] ?? `N/A`;
        return { icao, name };
    }
    
    /**
     * getCorrectIssuedDate ensures the issued date is valid and falls back to the current date if not.
     *
     * @private
     * @static
     * @param {Record<string, string>} attributes 
     * @returns {*} 
     */
    private static getCorrectIssuedDate(attributes: Record<string, string>) {
        const time = attributes.issue != null ? 
            new Date(attributes.issue).toLocaleString() : (attributes?.issue != null ? 
            new Date(attributes.issue).toLocaleString() : 
            new Date().toLocaleString());
        if (time == `Invalid Date`) return new Date().toLocaleString();
        return time;
    }
    
    /**
     * getCorrectExpiryDate determines the correct expiration date for an alert based on VTEC information or UGC zones.
     *
     * @private
     * @static
     * @param {types.VTECParsed} vtec 
     * @param {types.UGCParsed} ugc 
     * @returns {*} 
     */
    private static getCorrectExpiryDate(vtec: types.VTECParsed, ugc: types.UGCParsed) {
        const time =  vtec?.expires && !isNaN(new Date(vtec.expires).getTime()) ? 
            new Date(vtec.expires).toLocaleString() : 
            (ugc?.expiry != null ? new Date(ugc.expiry).toLocaleString() : 
            new Date(new Date().getTime() + 1 * 60 * 60 * 1000).toLocaleString())
        if (time == `Invalid Date`) return new Date(new Date().getTime() + 1 * 60 * 60 * 1000).toLocaleString();
        return time;
    }

}

export default EventParser