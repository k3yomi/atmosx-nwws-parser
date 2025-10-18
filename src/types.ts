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

interface GlobalSettings { 
    useParentEvents: boolean,
    betterEventParsing: boolean 
    easSettings: { 
        easAlerts: string[], 
        easDirectory: string, 
        easIntroWav: string | null 
    },  
    alertFiltering: { 
        filteredEvents: string[], 
        filteredICOAs: string[], 
        ignoredICOAs: string[], 
        ugcFilter: string[], 
        stateFilter: string[], 
        ignoredEvents: string[], 
        checkExpired: boolean 
    }, 
}

interface DefaultParameters { 
    wmo: string,
    source: string,
    max_hail_size: string,
    max_wind_gust: string,
    damage_threat: string,
    tornado_detection: string,
    flood_detection: string,
    discussion_tornado_intensity: string,
    discussion_wind_intensity: string,
    discussion_hail_intensity: string
    WMOidentifier?: string[],
    VTEC?: string,
    maxHailSize?: string,
    maxWindGust?: string,
    thunderstormDamageThreat?: string[],
    tornadoDetection?: string[],
    waterspoutDetection?: string[],
    floodDetection?: string[],
    AWIPSidentifier?: string[],
    NWSheadline?: string[],
}

interface DefaultAttributes { 
    xmlns?: string, 
    id?: string, 
    issue?: string, 
    ttaaii?: string, 
    cccc?: string, 
    awipsid?: string, 
    getAwip?: Record<string, string>
}

interface ClientReconnectSettings { 
    canReconnect: boolean, 
    currentInterval: number 
}

interface ClientCredentialSettings { 
    username: string, 
    password: string, 
    nickname: string 
}

interface ClientCacheSettings { 
    read: boolean,
    maxSizeMB: number, 
    directory: string, 
    maxHistory: number 
}

interface ClientAlertSettings { 
    isCapOnly: boolean, 
    isShapefileUGC: boolean 
}

interface NoaaWeatherWireServiceSettings { 
    clientReconnections: ClientReconnectSettings, 
    clientCredentials: ClientCredentialSettings,
    cache: ClientCacheSettings, 
    alertPreferences: ClientAlertSettings 
}

interface NationalWeatherServiceSettings { 
    checkInterval: number, 
    endpoint: string 
}

export interface EnhancedEventCondition { 
    description?: string; 
    condition?: (value: string) => boolean; 
}

export interface TypeAttributes { 
    awipsType?: Record<string, string>, 
    isCap: boolean, 
    awipsid?: string, 
    raw: boolean, 
    issue?: string, 
    type?: string, 
    prefix?: string, 
    getAwip?: { type: string, prefix: string }
}

export interface NationalWeatherServiceResponse { 
    error: boolean,
    message?: { features: TypeAlert[] }
}

export interface VTECParsed { 
    raw: string, 
    tracking: string, 
    event: string, 
    status: string, 
    wmo: string, 
    expires: string 
}
export interface UGCParsed { 
    zones: string[], 
    locations: string[], 
    expiry: Date | null, 
    polygon: [number, number][] 
}

export interface BaseProperties {
    event?: string, 
    locations: string,
    issued: string,
    expires: string,
    geocode: { UGC: string[] },
    description: string,
    sender_name: string,
    sender_icao: string,
    attributes: DefaultAttributes,
    parameters: DefaultParameters,
    geometry: { type?: string, coordinates?: [number, number][] } | null
    messageType?: string,
    sent?: string,
    areaDesc?: string,
}

export interface TypeAlert { 
    performance: number, 
    tracking: string,
    header: string,
    vtec: string,
    history: { description: string, issued: string, type: string }[],
    properties: BaseProperties
    geometry: { type?: string, coordinates?: [number, number][] } | null
}

export interface ClientSettings {
    database?: string,
    isNWWS: boolean,
    catchUnhandledExceptions: boolean,
    NoaaWeatherWireService: NoaaWeatherWireServiceSettings,
    NationalWeatherService: NationalWeatherServiceSettings,
    global: GlobalSettings,
}

export interface TypeCompiled { 
    message: string | null,
    attributes: DefaultAttributes,
    isCap: boolean,
    isApi: boolean,
    isCapDescription: boolean,
    isVtec: boolean,
    isUGC: boolean,
    getAwip?: { type: string, prefix: string },
    awipsType: { type: string, prefix: string } | null,
    awipsPrefix?: string,
    ignore: boolean,
}


export type HTTPSettings = { timeout?: number, headers?: Record<string, string> }