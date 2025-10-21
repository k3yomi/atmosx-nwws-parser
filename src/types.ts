/*
                                            _               _     __   __
         /\  | |                           | |             (_)    \ \ / /
        /  \ | |_ _ __ ___   ___  ___ _ __ | |__   ___ _ __ _  ___ \ V / 
       / /\ \| __| '_ ` _ \ / _ \/ __| '_ \| '_ \ / _ \ '__| |/ __| > <  
      / ____ \ |_| | | | | | (_) \__ \ |_) | | | |  __/ |  | | (__ / . \ 
     /_/    \_\__|_| |_| |_|\___/|___/ .__/|_| |_|\___|_|  |_|\___/_/ \_\
                                     | |                                 
                                     |_|                                                                                                                
    
    Written by: k3yomi@GitHub                        
*/

// ----------- Settings ----------- //
interface LocalEasSettings {
    directory?: string;
    intro_wav?: string;
    festival_tts_voice?: string;
}

interface LocalLocationFilteringSettings { 
    filter?: boolean;
    max_distance?: number;
    unit?: 'miles' | 'kilometers';
}

interface LocalAlertFilteringSettings { 
    events?: string[]; 
    filtered_icoa?: string[]; 
    ignored_icoa?: string[]; 
    ugc_filter?: string[]; 
    state_filter?: string[]; 
    ignored_events?: string[]; 
    check_expired?: boolean;
    location?: LocalLocationFilteringSettings;
}

interface LocalGlobalSettings {
    parent_events_only?: boolean;
    better_event_parsing?: boolean;
    eas_settings?: LocalEasSettings;
    filtering?: LocalAlertFilteringSettings;
}

interface LocalClientReconnectionSettings { 
    enabled?: boolean;
    interval?: number;
}

interface LocalClientCredentialSettings {
    username?: string;
    password?: string;
    nickname?: string;
}

interface LocalCacheSettings { 
    enabled?: boolean;
    max_file_size?: number;
    max_db_history?: number;
    directory?: string;
}

interface LocalAlertPreferenceSettings {
    cap_only?: boolean;
    shapefile_coordinates?: boolean;
}

interface LocalNoaaWeatherWireServiceSettings {
    reconnection_settings?: LocalClientReconnectionSettings;
    credentials?: LocalClientCredentialSettings;
    cache?: LocalCacheSettings;
    preferences?: LocalAlertPreferenceSettings;
}

interface LocalNationalWeatherServiceSettings {
    interval?: number;
    endpoint?: string;
}

// --- Exports --- //
export interface ClientSettingsTypes {
    database?: string;
    is_wire?: boolean;
    journal?: boolean;
    noaa_weather_wire_service_settings?: LocalNoaaWeatherWireServiceSettings;
    national_weather_service_settings?: LocalNationalWeatherServiceSettings;
    global_settings?: LocalGlobalSettings;
}


// ----------- Alert / Events ----------- //


interface LocalEventHistory { 
    description?: string;
    issued?: string;
    type?: string;
}

interface LocalGeoJSON {
    type?: string;
    coordinates?: [number, number][];
    geometry?: { type?: string, coordinates?: [number, number][] };
    properties?: Record<string, unknown>;
}

interface LocalEventParameters {
    wmo?: string;
    source?: string;
    max_hail_size?: string;
    max_wind_gust?: string;
    damage_threat?: string;
    tornado_detection?: string;
    flood_detection?: string;
    discussion_tornado_intensity?: string;
    discussion_wind_intensity?: string;
    discussion_hail_intensity?: string;
    WMOidentifier?: string[];
    VTEC?: string;
    maxHailSize?: string;
    maxWindGust?: string;
    thunderstormDamageThreat?: string[];
    tornadoDetection?: string[];
    waterspoutDetection?: string[];
    floodDetection?: string[];
    AWIPSidentifier?: string[];
    NWSheadline?: string[];
}

interface LocalEventProperties { 
    parent?: string;
    event?: string; 
    locations?: string;
    issued?: string;
    expires?: string;
    geocode?: { UGC: string[] };
    description?: string;
    sender_name?: string;
    sender_icao?: string;
    metadata?: DefaultAttributesType;
    parameters?: LocalEventParameters;
    geometry?: LocalGeoJSON | null;
    messageType?: string;
    sent?: string;
    areaDesc?: string;
    distance?: Record<string, { distance: number, unit: string}>,
}

// --- Exports --- //

export interface StanzaAttributesType {
    xmlns?: string; 
    id?: string; 
    issue?: string; 
    ttaaii?: string; 
    cccc?: string; 
    awipsid?: string; 
}
export interface DefaultAttributesType {
    attributes?: {
        xmlns?: string; 
        id?: string; 
        issue?: string; 
        ttaaii?: string; 
        cccc?: string; 
        awipsid?: string; 
    }
    getAwip?: Record<string, string>;
    awipsType?: Record<string, string>;
    isCap?: boolean;
    raw?: boolean;
}

export interface StanzaCompiled { 
    message?: string;
    attributes?: DefaultAttributesType;
    isCap?: boolean;
    isApi?: boolean;
    isCapDescription?: boolean;
    isVtec?: boolean;
    isUGC?: boolean;
    getAwip?: Record<string, string>;
    awipsType?: Record<string, string>;
    awipsPrefix?: string;
    ignore?: boolean;
    awipsid?: string;
}

export interface VtecEntry { 
    raw?: string;
    type?: string;
    tracking?: string;
    event?: string;
    status?: string;
    wmo?: string[];
    expires?: Date | string;
}

export interface UGCEntry { 
    zones?: string[];
    locations?: string[];
    expiry?: Date | string;
    polygon?: [number, number][];
}

export interface EventCompiled {
    performance?: number;
    tracking?: string;
    header?: string;
    vtec?: string;
    history?: LocalEventHistory[];
    properties?: LocalEventProperties;
    geometry?: { type?: string; coordinates?: [number, number][] } | null;
}

export type EventProperties = LocalEventProperties;
export type StanzaAttributes = DefaultAttributesType;


// ----------- Generic ----------- //

// --- Exports --- //
export type Coordinates = { 
    lon: number; 
    lat: number;
}

export type HTTPSettings = { 
    timeout?: number;
    headers?: Record<string, string>;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: string;
}

export interface EnhancedEventCondition {
    description?: string; 
    condition?: (value: string) => boolean; 
}

export interface GenericHTTPResponse { 
    error?: boolean,
    message?: { features: Record<string, any>[] } | string,
}