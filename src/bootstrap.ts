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

import { TypeEvent } from "StaticTypes/Event"
import { TypeHash } from "Types/Hash"
import { TypeActions } from "Types/Actions"
import { TypeNode } from "Types/Nodes"
import { EnumThemes } from "@Enums/Themes"
import { EventEmitter } from "node:events"
import { client } from "@xmpp/client"
import { Database } from "better-sqlite3"
import { join } from "path"

export const Bootstrap = {
    Version: `3.0.75`,
    Ready: true,
    Ratelimits: {} as Record<string, number[]>,
    Session: null as ReturnType<typeof client>,
    Database: null as Database,
    Job: null as unknown,
    Listener: new EventEmitter(),
    Colors: {
        Red: `\x1b[31m`, Green: `\x1b[32m`, Yellow: `\x1b[33m`,
        Blue: `\x1b[34m`, Magenta: `\x1b[35m`, Cyan: `\x1b[36m`,
        White: `\x1b[37m`, Reset: `\x1b[0m`
    },
    Cache: {
        LastStanzaTime: null as number,
        Connected: false,
        Reconnecting: false,
        TotalReconnects: 0,
        Hault: false,
        Events: {type: "FeatureCollection", features: [] as TypeEvent[]},
        Nodes: {type: "FeatureCollection", features: [] as TypeNode[]},
        Hashes: [] as TypeHash[],
        Parsed: [] as TypeEvent[],
        UGC: new Map<string, string[]>()
    },
    Settings: {
        Timezone: "UTC",
        Database: join(process.cwd(), 'shapefiles.db'),
        DebugDisableAllEvents: false,
        EnableWireService: false,
        EnableDebugging: false,
        EnableJournal: true,
        EnhancedEventJournaling: false,
        NOAAWeatherWireServiceSettings: {
            ReconnectionSettings: {
                Enabled: true,
                ReconnectionInterval: 60,
            },
            CredentialSettings: {
                Username: null as string,
                Password: null as string,
                Nickname: "@atmosx/event-product-parser/3.0",
            },   
            CacheSettings: {
                Enabled: true,
                MaxDatabaseHistory: 5000,
                MaxRetentionHistory: 1000,
            },
            StanzaSettings: {
                DisableUGC: false,
                DisableVTEC: false,
                DisableText: false,
            }
        },
        NationalWeatherServiceSettings: {
            CallbackInterval: 15,
            EventsEndpoint: `https://api.weather.gov/alerts/active`,
        },
        BroadcastifySettings: {
            BroadcastifyAttachments: true,
            BroadcastifyDatabase: `https://scriptkitty.cafe/ftp/@atmosphericx/assets/broadcastify.json`,
            BroadcastifyTags: [`Ham`, `Air`, `Fire`, `Public Safety`, `Weather`, `EMS`, `Police`, `Rail`]
        },
        BoundarySettings: {
            BoundaryDatabase: `https://scriptkitty.cafe/ftp/@atmosphericx/assets/counties-10m.json`,
            CityDatabase: `https://scriptkitty.cafe/ftp/@atmosphericx/assets/cities500.json`
        },
        NotifyServer: {
            Enabled: false,
            Server: `https://ntfy.sh`,
            MediaStorage: {
                AUDIO: null as string,
                TEXT: null as string,
                JSON: null as string,
                IMAGE: null as string
            },
            Credentials: {
                Username: null as string,
                Password: null as string
            }
        },
        ActionSettings: [] as TypeActions[],
        GlobalSettings: {
            EventManagement: true,
            DisableGeometryParsing: false,
            UseShapefileCoordinates: true,
            SPCWatchesOnly: true,
            CensusPopulationData: true,
            NodeTTL: 60,
            NodeMaxDistance: 120,
            EventFiltering: {
                ListeningEvents: [] as string[],
                ListeningICAO: [] as string[],
                ListeningUGC: [] as string[],
                ListeningStates: [] as string[],
                IgnoredICAO: [] as string[],
                IgnoredEvents: [`Test Message`],
                NodeLocationFiltering: false,
                IgnoreTestProducts: true,
            },
            Themes: EnumThemes,
            ArchiveSettings: {
                TTL: 60,
                ImageDirectory: `Archive/Images` as string,
                JSONDirectory: `Archive/Products` as string,
                TextDirectory: `Archive/Text` as string,
                AudioDirectory: `Archive/Audio` as string,
                Logo: null as string,
                AudioToneout: null as string
            }
        }
    },
}



