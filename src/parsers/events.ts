

import * as loader from '../bootstrap';
import * as types from '../types';
import TextParser from './text';
import UGCParser from './ugc';
import VTECAlerts from './events/vtec';
import UGCAlerts from './events/ugc';
import TextAlerts from './events/text';
import CAPAlerts from './events/cap';
import APIAlerts from './events/api';
import Utils from '../utils';


export class EventParser {
    
    /**
     * @function getBaseProperties
     * @description
     *     Extracts and compiles the core properties of a weather
     *     alert message into a structured object. Combines parsed
     *     textual data, UGC information, VTEC entries, and additional
     *     metadata for downstream use.
     *
     * @static
     * @async
     * @param {string} message
     * @param {types.StanzaCompiled} validated
     * @param {types.UGCEntry} [ugc=null]
     * @param {types.PVtecEntry} [pVtec=null]
     * @param {types.HVtecEntry} [hVtec=null]
     * @returns {Promise<Record<string, any>>}
     */
    public static async getBaseProperties(message: string, metadata: types.DefaultAttributesType, ugc: types.UGCEntry = null, pVtec: types.PVtecEntry = null, hVtec: types.HVtecEntry = null) {
        const settings = loader.settings as types.ClientSettingsTypes;
        const definitions = {
            tornado: TextParser.textProductToString(message, `TORNADO...`) ?? TextParser.textProductToString(message, `WATERSPOUT...`) ?? `N/A`,
            hail: TextParser.textProductToString(message, `MAX HAIL SIZE...`, [`IN`]) ?? TextParser.textProductToString(message, `HAIL...`, [`IN`]) ?? `N/A`,
            gusts: TextParser.textProductToString(message, `MAX WIND GUST...`) ?? TextParser.textProductToString(message, `WIND...`) ?? `N/A`,
            flood: TextParser.textProductToString(message, `FLASH FLOOD...`) ?? `N/A`,
            damage: TextParser.textProductToString(message, `DAMAGE THREAT...`) ?? `N/A`,
            source: TextParser.textProductToString(message, `SOURCE...`, [`.`]) ?? `N/A`,
            description: TextParser.textProductToDescription(message, pVtec?.raw ?? null),
            wmo: message.match(loader.definitions.regular_expressions.wmo)?.[0] ?? `N/A`,
            mdTorIntensity: TextParser.textProductToString(message, `MOST PROBABLE PEAK TORNADO INTENSITY...`) ?? `N/A`,
            mdWindGusts: TextParser.textProductToString(message, `MOST PROBABLE PEAK WIND GUST...`) ?? `N/A`,
            mdHailSize: TextParser.textProductToString(message, `MOST PROBABLE PEAK HAIL SIZE...`) ?? `N/A`,
        };
        const getOffice = this.getICAO(pVtec, metadata, definitions.wmo);
        const getCorrectIssued = this.getCorrectIssuedDate(metadata);
        const getCorrectExpiry = this.getCorrectExpiryDate(pVtec, ugc);
        const base = { 
            locations: ugc?.locations.join(`; `) ?? `No Location Specified (UGC Missing)`,
            issued: getCorrectIssued,
            expires: getCorrectExpiry,
            geocode: { UGC: ugc?.zones ?? [`XX000`] },
            description: definitions.description,
            sender_name: getOffice.name,
            sender_icao: getOffice.icao,
            raw: {...Object.fromEntries(Object.entries(metadata).filter(([key]) => key !== 'message'))},
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
        };
        return base;
    }

    /**
     * @function getEventGeometry
     * @description
     *   Determines the geometry of an event using polygon data fromEntries
     *   in the message or UGC shapefile coordinates if enabled in settings. Falls
     *   back to null if no geometry can be determined.
     * 
     * @static
     * @param {string} message
     * @param {types.UGCEntry} [ugc=null]
     * @returns {Promise<types.geometry>}
     */
    public static async getEventGeometry(message: string, ugc: types.UGCEntry = null) : Promise<types.geometry> {
        const settings = loader.settings as types.ClientSettingsTypes;
        const polygonText = TextParser.textProductToPolygon(message);
        let geometry = null;
        geometry = polygonText.length > 0 ? { type: "Polygon", coordinates: polygonText } : null;
        if (settings.global_settings.shapefile_coordinates && polygonText.length == 0 && ugc != null) {
            const coordinates = await UGCParser.getCoordinates(ugc.zones) as any;
            geometry = { type: "Polygon", coordinates: coordinates };
        }
        return geometry;
    }
    
    /**
     * @function betterParsedEventName
     * @description
     *     Enhances the parsing of an event name using additional criteria
     *     from its description and parameters. Can optionally use
     *     the original parent event name instead.
     *
     * @static
     * @param {types.EventCompiled} event
     * @param {boolean} [betterParsing=false]
     * @param {boolean} [useParentEvents=false]
     * @returns {string}
     */
    public static betterParsedEventName(event: types.EventCompiled, betterParsing?: boolean, useParentEvents?: boolean) {
        let eventName = event?.properties?.event ?? `Unknown Event`;
        const defEventTable = loader.definitions.enhancedEvents;
        const properties = event?.properties;
        const parameters = properties?.parameters;
        const description = properties?.description ?? `Unknown Description`;
        const damageThreatTag = parameters?.damage_threat ?? `N/A`;
        const tornadoThreatTag = parameters?.tornado_detection ?? `N/A`;
        if (!betterParsing) { return eventName }
        for (const eventGroup of defEventTable) {
            const [baseEvent, conditions] = Object.entries(eventGroup)[0] as [string, Record<string, types.EnhancedEventCondition>];
            if (eventName === baseEvent) {
                for (const [specificEvent, condition] of Object.entries(conditions)) {
                    const conditionMet = (condition.description && description.includes(condition.description.toLowerCase())) || (condition.condition && condition.condition(damageThreatTag || tornadoThreatTag));
                    if (conditionMet) { eventName = specificEvent; break; }
                }   
                if (baseEvent === 'Severe Thunderstorm Warning' && tornadoThreatTag === 'POSSIBLE' && !eventName.includes('(TPROB)')) eventName += ' (TPROB)';
                break;

            }
        }
        return useParentEvents ? event?.properties?.event : eventName;
    }
   
    /**
     * @function validateEvents
     * @description
     *     Processes an array of event objects and filters them based on
     *     global and EAS filtering settings, location constraints, and
     *     other criteria such as expired or test products. Valid events
     *     trigger relevant event emitters.
     *
     * @static
     * @param {unknown[]} events
     * @returns {void}
     */
    public static validateEvents(events: unknown[]) {
        if (events.length == 0) return;
        const filteringSettings = loader.settings?.global_settings?.filtering;
        const locationSettings = filteringSettings?.location;
        const easSettings = loader.settings?.global_settings?.eas_settings;
        const globalSettings = loader.settings?.global_settings;
        const sets = {} as Record<string, Set<string>>;
        const bools = {} as Record<string, boolean>;
        const megered = {...filteringSettings, ...easSettings, ...globalSettings, ...locationSettings };
        for (const key in megered) {
            const setting = megered[key];
            if (Array.isArray(setting)) { sets[key] = new Set(setting.map(item => item.toLowerCase())); }
            if (typeof setting === 'boolean') { bools[key] = setting; }
        }
        const filtered = events.filter((alert: types.EventCompiled) => {
            const originalEvent = this.buildDefaultSignature(alert);
            const props = originalEvent?.properties;
            const ugcs = props?.geocode?.UGC ?? [];
            const { details, ...eventWithoutPerformance } = originalEvent
            originalEvent.properties.parent = originalEvent.properties.event;          
            originalEvent.properties.event = this.betterParsedEventName(originalEvent, bools?.better_event_parsing, bools?.parent_events_only);
            originalEvent.hash = loader.packages.crypto.createHash('md5').update(JSON.stringify(eventWithoutPerformance)).digest('hex');
            originalEvent.properties.distance = this.getLocationDistances(props, originalEvent.geometry, locationSettings?.unit);
            if (originalEvent.properties.is_test == true && bools?.ignore_text_products) return false;
            if (bools?.check_expired && originalEvent.properties.is_cancelled == true) return false;
            for (const key in sets) {
                const setting = sets[key];
                if (key === 'events' && setting.size > 0 && !setting.has(originalEvent.properties.event.toLowerCase())) return false; 
                if (key === 'ignored_events' && setting.size > 0 && setting.has(originalEvent.properties.event.toLowerCase())) return false;
                if (key === 'filtered_icao' && setting.size > 0 && props.sender_icao != null && !setting.has(props.sender_icao.toLowerCase())) return false;
                if (key === 'ignored_icao' && setting.size > 0 && props.sender_icao != null && setting.has(props.sender_icao.toLowerCase())) return false;
                if (key === 'ugc_filter' && setting.size > 0 && ugcs.length > 0 && !ugcs.some((ugc: string) => setting.has(ugc.toLowerCase()))) return false;
                if (key === 'state_filter' && setting.size > 0 && ugcs.length > 0 && !ugcs.some((ugc: string) => setting.has(ugc.substring(0, 2).toLowerCase()))) return false;
            }
            loader.cache.events.emit(`on${originalEvent.properties.parent.replace(/\s+/g, '')}`) 
            loader.cache.events.emit(`on${originalEvent.properties.event.replace(/\s+/g, '')}`) 
            return true;
        })
        if (filtered.length > 0) { loader.cache.events.emit(`onEvents`, filtered); }
    }

    /**
     * @function getHeader
     * @description
     *     Constructs a standardized alert header string using provided
     *     stanza attributes, event properties, and optional VTEC data.
     *
     * @static
     * @param {types.StanzaAttributes} attributes
     * @param {types.EventProperties} [properties]
     * @param {types.PVtecEntry} [pVtec]
     * @returns {string}
     */
    public static getHeader(attributes: types.StanzaAttributes, properties?: types.EventProperties, pVtec?: types.PVtecEntry) {
        const parent = `ATSX`
        const alertType = attributes?.awipsType?.type ?? attributes?.getAwip?.prefix ?? `XX`;
        const ugc = properties?.geocode?.UGC != null ? properties?.geocode?.UGC.join(`-`) : `000000`;
        const status = pVtec?.status ?? 'Issued';
        const issued = properties?.issued != null ? new Date(properties?.issued)?.toISOString().replace(/[-:]/g, '').split('.')[0] : new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
        const sender = properties?.sender_icao ?? `XXXX`;
        const header = `ZCZC-${parent}-${alertType}-${ugc}-${status}-${issued}-${sender}-`;
        return header
    }
   
    /**
     * @function eventHandler
     * @description
     *     Routes a validated stanza object to the appropriate alert handler
     *     based on its type flags: API, CAP, pVTEC (Primary VTEC), UGC, or plain text.
     *
     * @static
     * @param {types.StanzaCompiled} validated
     * @returns {void}
     */
    public static eventHandler(metadata: types.StanzaCompiled) {
        const settings = loader.settings as types.ClientSettingsTypes;
        const preferences = settings.noaa_weather_wire_service_settings.preferences;
        if (metadata.isApi) return APIAlerts.event(metadata)
        if (metadata.isCap) return CAPAlerts.event(metadata)
        if (!preferences.disable_vtec && !metadata.isCap && metadata.isPVtec && metadata.isUGC) return VTECAlerts.event(metadata);
        if (!preferences.disable_ugc && !metadata.isCap && !metadata.isPVtec && metadata.isUGC) return UGCAlerts.event(metadata); 
        if (!preferences.disable_text && !metadata.isCap && !metadata.isPVtec && !metadata.isUGC) return TextAlerts.event(metadata);
        return;
    }

    /**
     * @function getICAO
     * @description
     *     Determines the ICAO code and corresponding name for an event.
     *     Priority is given to the VTEC tracking code, then the attributes' `cccc` property, 
     *     and finally the WMO code if available. Returns "N/A" if none are found.
     *
     * @private
     * @static
     * @param {types.PVtecEntry | null} pVtec
     * @param {Record<string, string>} attributes
     * @param {RegExpMatchArray | string | null} WMO
     * @returns {{ icao: string; name: string }}
     */
    private static getICAO(pVtec: types.PVtecEntry, metadata: types.DefaultAttributesType, WMO: RegExpMatchArray | string | null) {
        const icao = pVtec != null ? pVtec?.tracking.split(`-`)[0] : (metadata.attributes?.cccc || (WMO != null ? (Array.isArray(WMO) ? WMO[0] : WMO) : `N/A`));
        const name = loader.definitions.ICAO?.[icao] ?? `N/A`;
        return { icao, name };
    }

    /**
     * @function getCorrectIssuedDate
     * @description
     *     Determines the issued date for an event based on the provided attributes.
     *     Falls back to the current date and time if no valid issue date is available.
     *
     * @private
     * @static
     * @param {Record<string, string>} attributes
     * @returns {string}
     */
    private static getCorrectIssuedDate(metadata: types.DefaultAttributesType) {
        const time = metadata.attributes.issue != null ? 
            new Date(metadata.attributes.issue).toLocaleString() : (metadata.attributes?.issue != null ? 
            new Date(metadata.attributes.issue).toLocaleString() : 
            new Date().toLocaleString());
        if (time == `Invalid Date`) return new Date().toLocaleString();
        return time;
    }

    /**
     * @function getCorrectExpiryDate
     * @description
     *     Determines the most appropriate expiry date for an event using VTEC or UGC data.
     *     Falls back to one hour from the current time if no valid expiry is available.
     *
     * @private
     * @static
     * @param {types.PVtecEntry} pVtec
     * @param {types.UGCEntry} ugc
     * @returns {string}
     */
    private static getCorrectExpiryDate(pVtec: types.PVtecEntry, ugc: types.UGCEntry) {
        const time =  pVtec?.expires && !isNaN(new Date(pVtec.expires).getTime()) ? 
            new Date(pVtec.expires).toLocaleString() : 
            (ugc?.expiry != null ? new Date(ugc.expiry).toLocaleString() : 
            new Date(new Date().getTime() + 1 * 60 * 60 * 1000).toLocaleString())
        if (time == `Invalid Date`) return `Until Further Notice`;
        return time;
    }

    /**
     * @function getLocationDistances
     * @description
     *     Calculates distances from an event's geometry to all current tracked locations.
     *     Optionally filters locations by a maximum distance.
     *
     * @private
     * @static
     * @param {types.EventProperties} [properties]
     * @param {types.EventCompiled} [event]
     * @param {string} [unit='miles']
     * @returns {Record<string, { distance: number, unit: string}>}
     */
    private static getLocationDistances(properties?: types.EventProperties, geometry?: types.geometry, unit: string = 'miles') {
        if (geometry != null) {
            for (const key in loader.cache.currentLocations) {
                const coordinates = loader.cache.currentLocations[key];
                const singleCoord = geometry.coordinates;
                const center = singleCoord.reduce((acc, [lat, lon]) => ([acc[0] + lat, acc[1] + lon]), [0, 0]).map(sum => sum / singleCoord.length);
                const validUnit = unit === 'miles' || unit === 'kilometers' ? unit : 'miles';
                const distance = Utils.calculateDistance({ lat: coordinates.lat, lon: coordinates.lon }, { lat: center[0], lon: center[1] }, validUnit);
                if (!properties.distance) { properties.distance = {}; }
                properties.distance[key] = { unit, distance };
            }
            return properties.distance
        }
        return {}
    }

    /**
     * @function buildDefaultSignature
     * @description
     *     Populates default properties for an event object, including action type flags,
     *     tags, and status updates. Determines if the event is issued, updated, or cancelled
     *     based on correlations, description content, VTEC codes, and expiration time.
     *
     * @private
     * @static
     * @param {any} event
     * @returns {any}
     */
    private static buildDefaultSignature(event: any) {
        const props = event.properties ?? {};
        const statusCorrelation = loader.definitions.correlations.find((c: { type: string }) => c.type === props.action_type);
        const defEventTags = loader.definitions.tags;
        const tags = Object.entries(defEventTags).filter(([key]) => props?.description.toLowerCase().includes(key.toLowerCase())).map(([, value]) => value)
        props.tags = tags.length > 0 ? tags : [`N/A`];
        const setAction = (type: `C` | `U` | `I`) => { 
            props.is_cancelled = type === `C`; 
            props.is_updated = type === `U`; 
            props.is_issued = type === `I`; 
        };
        if (statusCorrelation) { 
            props.action_type = statusCorrelation.forward ?? props.action_type; 
            props.is_updated = !!statusCorrelation.update; props.is_issued = !!statusCorrelation.new;
            props.is_cancelled = !!statusCorrelation.cancel;
        } else { setAction(`I`); }
        if (props.description) { 
            const detectedPhrase = loader.definitions.cancelSignatures.find(sig => props.description.toLowerCase().includes(sig.toLowerCase()));
            if (detectedPhrase) { setAction(`C`); }
        }
        if (event.pvtec) { 
            const getType = event.pvtec.split(`.`)[0];
            const isTestProduct = loader.definitions.productTypes[getType] == `Test Product`
            if (isTestProduct) { setAction(`C`); props.is_test = true; }
        }
        if (new Date(props?.expires).getTime() < new Date().getTime()) { setAction(`C`); }
        return event;
    }
}

export default EventParser