/*
              _                             _               _     __   __
         /\  | |                           | |             (_)    \ \ / /
        /  \ | |_ _ __ ___   ___  ___ _ __ | |__   ___ _ __ _  ___ \ V / 
       / /\ \| __| '_ ` _ \ / _ \/ __| '_ \| '_ \ / _ \ '__| |/ __| > <  
      / ____ \ |_| | | | | | (_) \__ \ |_) | | | |  __/ |  | | (__ / . \ 
     /_/    \_\__|_| |_| |_|\___/|___/ .__/|_| |_|\___|_|  |_|\___/_/ \_\
                                     | |                            
                                     |_|                                                                                                                

    Created with ♥ by the AtmosphericX Team (KiyoWx, StarflightWx, & CJ Ziegler)
    Discord: https://atmosphericx-discord.scriptkitty.cafe
    Ko-Fi: https://ko-fi.com/k3yomi
    Documentation: https://atmosphericx.scriptkitty.cafe/documentation

    Independent Package: @atmosx/event-product-parser

*/

import { TypeActions } from "Types/Actions"

type TypeTimezones = string | "CST" | "CDT" | "MDT" | "MST" | "EST" | "EDT" | "HST" | "HDT" | "PDT" | "UTC"

export type TypeSettings = {
    Timezone?: TypeTimezones
    Database: string
    DebugDisableAllEvents: boolean
    EnableWireService: boolean
    EnableJournal: boolean
    EnableDebugging: boolean
    NOAAWeatherWireServiceSettings: {
        ReconnectionSettings: {
            Enabled: boolean
            ReconnectionInterval: number
        }
        CredentialSettings: {
            Username: string | void
            Password: string | void
            Nickname: string | void
        }
        CacheSettings: {
            Enabled: boolean
            MaxDatabaseHistory: number
            MaxRetentionHistory: number
        }
        StanzaSettings: {
            DisableUGC: boolean
            DisableVTEC: boolean
            DisableText: boolean
        }
    }
    NationalWeatherServiceSettings: {
        CallbackInterval: number
        EventsEndpoint: string
    }
    BroadcastifySettings: {
        BroadcastifyAttachments: boolean
        BroadcastifyDatabase: string
        BroadcastifyTags: string[]
    },
    BoundarySettings: {
        BoundaryDatabase: string
        CityDatabase: string
    },
    NotifyServer: {
        Enabled: boolean
        Server: string
        MediaStorage: {
            TEXT?: string
            JSON?: string
            AUDIO?: string
            IMAGE?: string
        }
        Credentials?: {
            Username: string | void
            Password: string | void
        }
    }
    ActionSettings?: TypeActions[]
    GlobalSettings: {
        EventManagement: boolean
        DisableGeometryParsing: boolean
        UseShapefileCoordinates: boolean
        SPCWatchesOnly: boolean
        CensusPopulationData: boolean
        NodeTTL: number
        NodeMaxDistance: number
        EventFiltering: {
            ListeningEvents: string[]
            ListeningICAO: string[]
            ListeningUGC: string[]
            ListeningStates: string[]
            IgnoredICAO: string[]
            IgnoredEvents: string[]
            NodeLocationFiltering: boolean
            IgnoreTestProducts: boolean
        },
        Themes: { Event: string, RGB: string }[]
        ArchiveSettings: {
            TTL: number
            ImageDirectory: string
            JSONDirectory: string
            TextDirectory: string
            AudioDirectory: string
            Logo: string
            AudioToneout: string
        }
    }
}