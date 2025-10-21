

import * as loader from '../bootstrap';
import * as types from '../types';
import TextParser from './text';
import UGCParser from './ugc';
import VTECAlerts from './types/vtec';
import UGCAlerts from './types/ugc';
import TextAlerts from './types/text';
import CAPAlerts from './types/cap';
import APIAlerts from './types/api';
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
     *     The raw text of the weather alert or CAP/TEXT product.
     *
     * @param {types.StanzaCompiled} validated
     *     The validated stanza object containing attributes,
     *     flags, and metadata.
     *
     * @param {types.UGCEntry} [ugc=null]
     *     Optional UGC entry object providing zones, locations, and
     *     expiry information.
     *
     * @param {types.VtecEntry} [vtec=null]
     *     Optional VTEC entry object for extracting tracking,
     *     type, and expiration information.
     *
     * @returns {Promise<Record<string, any>>}
     *     A promise resolving to a fully structured object with:
     *     - locations: string of all UGC locations.
     *     - issued: ISO string of the issued timestamp.
     *     - expires: ISO string of the expiry timestamp.
     *     - geocode: Object with UGC zone identifiers.
     *     - description: Parsed description of the alert.
     *     - sender_name: Name of issuing office.
     *     - sender_icao: ICAO code of issuing office.
     *     - attributes: Combined stanza attributes with AWIP info.
     *     - parameters: Extracted hazard parameters (tornado, hail, wind, flood, etc.).
     *     - geometry: Polygon coordinates if available or derived from shapefiles.
     *
     * @remarks
     *     - Falls back to shapefile coordinates if no polygon is in the message
     *       and shapefile preferences are enabled.
     *     - Uses multiple helper methods including:
     *       - `TextParser.textProductToString`
     *       - `TextParser.textProductToPolygon`
     *       - `TextParser.textProductToDescription`
     *       - `this.getICAO`
     *       - `this.getCorrectIssuedDate`
     *       - `this.getCorrectExpiryDate`
     *       - `TextParser.awipTextToEvent`
     */
    public static async getBaseProperties(message: string, validated: types.StanzaCompiled, ugc: types.UGCEntry = null, vtec: types.VtecEntry = null) {
        const settings = loader.settings as types.ClientSettingsTypes;
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
        if (settings.noaa_weather_wire_service_settings.preferences.shapefile_coordinates && base.geometry == null && ugc != null) {
            const coordinates = await UGCParser.getCoordinates(ugc.zones);
            base.geometry = { type: "Polygon", coordinates };
        }
        return base;
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
     *     The event object containing properties such as `event`,
     *     `description`, and `parameters` to analyze for better parsing.
     *
     * @param {boolean} [betterParsing=false]
     *     Whether to attempt enhanced parsing using `enhancedEvents` definitions.
     *
     * @param {boolean} [useParentEvents=false]
     *     If true, returns the original parent event name instead of
     *     the parsed/enhanced name.
     *
     * @returns {string}
     *     Returns the improved or original event name based on the
     *     parsing rules and flags.
     *
     * @remarks
     *     - Uses `loader.definitions.enhancedEvents` to map base events to
     *       more specific event names depending on conditions.
     *     - Appends `(TPROB)` for certain Severe Thunderstorm Warning events
     *       if `damage_threat` indicates a possible tornado.
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
                if (baseEvent === 'Severe Thunderstorm Warning' && damageThreatTag === 'POSSIBLE' && !eventName.includes('(TPROB)')) eventName += ' (TPROB)';
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
     *     An array of events to validate and filter. Each event is
     *     expected to conform to the internal structure of a compiled alert.
     *
     * @returns {void}
     *     This function does not return a value. Valid and filtered events
     *     are emitted via the event system (`loader.cache.events`).
     *
     * @remarks
     *     - Events are augmented with default signatures and computed
     *       distances before filtering.
     *     - Supports multiple filter categories, including events, ignored
     *       events, ICAO, UGC codes, and state codes.
     *     - Emits events for each valid alert, both by parent and by
     *       specific event name.
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
            const { performance, header, ...eventWithoutPerformance } = originalEvent;
            originalEvent.properties.parent = originalEvent.properties.event;          
            originalEvent.properties.event = this.betterParsedEventName(originalEvent, bools?.better_event_parsing, bools?.parent_events_only);
            originalEvent.hash = loader.packages.crypto.createHash('md5').update(JSON.stringify(eventWithoutPerformance)).digest('hex');
            originalEvent.properties.distance = this.getLocationDistances(props, bools?.filter, locationSettings?.max_distance, locationSettings?.unit);
            if (!originalEvent.properties.distance?.in_range && bools?.filter) { return false; }
            if (originalEvent.properties.is_test == true && bools?.ignore_text_products) return false;
            if (bools?.check_expired && originalEvent.properties.is_cancelled == true) return false;
            for (const key in sets) {
                const setting = sets[key];
                if (key === 'events' && setting.size > 0 && !setting.has(originalEvent.properties.event.toLowerCase())) return false; 
                if (key === 'ignored_events' && setting.size > 0 && setting.has(originalEvent.properties.event.toLowerCase())) return false;
                if (key === 'filtered_icoa' && setting.size > 0 && props.sender_icao != null && !setting.has(props.sender_icao.toLowerCase())) return false;
                if (key === 'ignored_icoa' && setting.size > 0 && props.sender_icao != null && setting.has(props.sender_icao.toLowerCase())) return false;
                if (key === 'ugc_filter' && setting.size > 0 && ugcs.length > 0 && !ugcs.some((ugc: string) => setting.has(ugc.toLowerCase()))) return false;
                if (key === 'state_filter' && setting.size > 0 && ugcs.length > 0 && !ugcs.some((ugc: string) => setting.has(ugc.substring(0, 2).toLowerCase()))) return false;
            }
            loader.cache.events.emit(`on${originalEvent.properties.parent.replace(/\s+/g, '')}`) 
            loader.cache.events.emit(`on${originalEvent.properties.event.replace(/\s+/g, '')}`) 
            return true;
        })
        if (filtered.length > 0) { loader.cache.events.emit(`onAlerts`, filtered); }
    }

    /**
     * @function getHeader
     * @description
     *     Constructs a standardized alert header string using provided
     *     stanza attributes, event properties, and optional VTEC data.
     *
     * @static
     * @param {types.StanzaAttributes} attributes
     *     The stanza attributes containing AWIPS type and related metadata.
     * @param {types.EventProperties} [properties]
     *     Optional event properties, such as geocode, issued time, and sender ICAO.
     * @param {types.VtecEntry} [vtec]
     *     Optional VTEC entry providing status information for the alert.
     *
     * @returns {string}
     *     A formatted alert header string following the ZCZC header convention.
     */
    public static getHeader(attributes: types.StanzaAttributes, properties?: types.EventProperties, vtec?: types.VtecEntry) {
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
     * @function eventHandler
     * @description
     *     Routes a validated stanza object to the appropriate alert handler
     *     based on its type flags: API, CAP, VTEC, UGC, or plain text.
     *
     * @static
     * @param {types.StanzaCompiled} validated
     *     The validated stanza object containing flags and message details
     *     used to determine the correct alert processing pipeline.
     *
     * @returns {void}
     */
    public static eventHandler(validated: types.StanzaCompiled) {
        if (validated.isApi) return APIAlerts.event(validated)
        if (validated.isCap) return CAPAlerts.event(validated)
        if (!validated.isCap && validated.isVtec && validated.isUGC) return VTECAlerts.event(validated);
        if (!validated.isCap && !validated.isVtec && validated.isUGC) return UGCAlerts.event(validated); 
        if (!validated.isCap && !validated.isVtec && !validated.isUGC) return TextAlerts.event(validated);
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
     * @param {types.VtecEntry | null} vtec
     *     The VTEC entry object, which may contain tracking information.
     * @param {Record<string, string>} attributes
     *     Event attributes object, potentially containing a `cccc` field.
     * @param {RegExpMatchArray | string | null} WMO
     *     WMO code or match array, used as a fallback if VTEC and attributes do not provide a code.
     *
     * @returns {{ icao: string; name: string }}
     *     An object containing the ICAO code and its human-readable name.
     */
    private static getICAO(vtec: types.VtecEntry, attributes: Record<string, string>, WMO: RegExpMatchArray | string | null) {
        const icao = vtec != null ? vtec?.tracking.split(`-`)[0] : (attributes?.cccc ?? (WMO != null ? (Array.isArray(WMO) ? WMO[0] : WMO) : `N/A`));
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
     *     The event attributes object, expected to contain an `issue` property.
     *
     * @returns {string}
     *     A locale-formatted string representing the calculated issued date and time.
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
     * @function getCorrectExpiryDate
     * @description
     *     Determines the most appropriate expiry date for an event using VTEC or UGC data.
     *     Falls back to one hour from the current time if no valid expiry is available.
     *
     * @private
     * @static
     * @param {types.VtecEntry} vtec
     *     The VTEC entry containing a potential `expires` date.
     * @param {types.UGCEntry} ugc
     *     The UGC entry containing a potential `expiry` date.
     *
     * @returns {string}
     *     A locale-formatted string representing the calculated expiry date and time.
     */
    private static getCorrectExpiryDate(vtec: types.VtecEntry, ugc: types.UGCEntry) {
        const time =  vtec?.expires && !isNaN(new Date(vtec.expires).getTime()) ? 
            new Date(vtec.expires).toLocaleString() : 
            (ugc?.expiry != null ? new Date(ugc.expiry).toLocaleString() : 
            new Date(new Date().getTime() + 1 * 60 * 60 * 1000).toLocaleString())
        if (time == `Invalid Date`) return new Date(new Date().getTime() + 1 * 60 * 60 * 1000).toLocaleString();
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
     *     Event properties object which must contain a `geometry` field with coordinates.
     *     Distances will be added to `properties.distance` keyed by location names.
     * @param {boolean} [isFiltered=false]
     *     If true, the returned `in_range` value reflects whether any location is within `maxDistance`.
     * @param {number} [maxDistance]
     *     Maximum distance to consider a location "in range" when `isFiltered` is true.
     * @param {string} [unit='miles']
     *     Unit of distance measurement: either 'miles' or 'kilometers'. Defaults to 'miles'.
     *
     * @returns {{ range?: Record<string, {unit: string, distance: number}>, in_range: boolean }}
     *     - `range`: Optional object containing distances for each location (unit + distance).
     *     - `in_range`: True if at least one location is within `maxDistance` or if no filtering is applied.
     */
    private static getLocationDistances(properties?: types.EventProperties, isFiltered?: boolean, maxDistance?: number, unit?: string) {
        let inRange = false;
        const totalTracks = Object.keys(loader.cache.currentLocations).length;
        if (properties.geometry != null) {
            for (const key in loader.cache.currentLocations) {
                const coordinates = loader.cache.currentLocations[key];
                const singleCoord = properties.geometry.coordinates;
                const center = singleCoord.reduce((acc, [lat, lon]) => ([acc[0] + lat, acc[1] + lon]), [0, 0]).map(sum => sum / singleCoord.length);
                const validUnit = unit === 'miles' || unit === 'kilometers' ? unit : 'miles';
                const distance = Utils.calculateDistance({ lat: coordinates.lat, lon: coordinates.lon }, { lat: center[0], lon: center[1] }, validUnit);
                if (!properties.distance) { properties.distance = {}; }
                properties.distance[key] = { unit, distance };
            }
            if (!isFiltered) { return {range: properties.distance, in_range: true}; }
            for (const key in properties.distance) {
                if (properties.distance[key].distance <= maxDistance) { inRange = true; }
            }
            return {range: properties.distance, in_range: totalTracks == 0 ? true : inRange}
        }
        return {in_range: false};
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
     *     The event object to process. Expected to have a `properties` object and optionally `vtec`.
     *
     * @returns {any}
     *     The event object with updated `properties`:
     *       - `is_cancelled`: True if the event is cancelled.
     *       - `is_updated`: True if the event is updated.
     *       - `is_issued`: True if the event is newly issued.
     *       - `tags`: Array of tags derived from the event description.
     *       - `is_test` (optional): True if the event is a test product.
     *       - `action_type`: Updated action type after correlation processing.
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
        if (event.vtec) { 
            const getType = event.vtec.split(`.`)[0];
            const isTestProduct = loader.definitions.productTypes[getType] == `Test Product`
            if (isTestProduct) { setAction(`C`); props.is_test = true; }
        }
        if (new Date(props?.expires).getTime() < new Date().getTime()) { setAction(`C`); }
        return event;
    }
}

export default EventParser