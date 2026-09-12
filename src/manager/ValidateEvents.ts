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
import { TypeSettings } from "Types/Settings"
import { Bootstrap } from "@Bootstrap"
import { GetEventEnhancedName } from "@Building/GetEventEnhancedName"
import { GetEventSignature } from "@Building/GetEventSignature"
import { MakeEvents } from "@Manager/MakeEvents"
import { RemoveEvent } from "@Manager/RemoveEvent"
import { GetEventAttachments } from "@Building/GetEventAttachments"
import { SetEventEmit } from "@Utilities/SetEventEmit"
import { SetDebug } from "@Utilities/SetDebug"
import { GetMatched } from "@Utilities/GetMatched"
import { GetEventPopulation } from "@Building/GetEventPopulation"
import { GetEventGeometry } from "@Building/GetEventGeometry"
import { createHash } from "crypto"

export const ValidateEvents = async (events: TypeEvent[]): Promise<void> => {
    const tick = performance.now();
    if (events.length === 0) return
    const configurations = Bootstrap.Settings as TypeSettings
    const sets = {} as Record<string, Set<string>>;
    const bools = {} as Record<string, boolean>;
    const megered = {...configurations.GlobalSettings, ...configurations.GlobalSettings.EventFiltering}
    for (const key in megered) {
        const setting = megered[key as keyof typeof megered]
        if (Array.isArray(setting)) { 
            (sets as Record<string, any>)[key] = new Set(setting.map(item => String(item).toLowerCase())); 
        }
        if (typeof setting === 'boolean') { 
            (bools as Record<string, any>)[key] = setting; 
        }
    }
    const isFiltered = (define: TypeEvent): boolean => {
        const properties = define.properties;
        const zones = properties.geocode.ugc;
        const icao = properties.geocode.office.office

        if (properties.status_metadata.is_test) { 
            SetEventEmit({ Event: `onTestProduct`, Metadata: define })
            if (bools?.IgnoreTestProducts) return true; 
        }
        
        if (properties.status_metadata.is_expired) { 
            SetEventEmit({ Event: `onExpiredProduct`, Metadata: define })
            RemoveEvent({ Event: define, IsTimeBasedExpiration: false })
            return true; 
        }
        
        if (properties.metadata?.vtec?.Watch && properties.metadata.source != `events.api`) {
            const isSPC = properties.metadata?.vtec?.PredictionCenter;
            SetEventEmit({ Event: isSPC ? `onStormPredictionWatch` : `onNonStormPredictionWatch`, Metadata: define })
            if (bools?.SPCWatchesOnly && !isSPC) {
                return true;
            }
            if ((!bools?.SPCWatchesOnly) && isSPC) {
                return true 
             }
        }

        for (const key in sets) {
            const setting = sets[key]
            const values = [...setting];
            if (key === 'ListeningEvents' && setting.size > 0 && !GetMatched({ Strings: values, String: define.properties.event })) {
                SetEventEmit({
                    Event: `onFilteredEvent`,
                    Metadata: define
                }); 
                return true 
            } 
            if (key === 'IgnoredEvents' && setting.size > 0 && GetMatched({ Strings: values, String: define.properties.event })) {
                SetEventEmit({
                    Event: `onIgnoredEvent`,
                    Metadata: define
                }); 
                return true 
            } 
            if (key === 'ListeningICAO' && setting.size > 0 && icao != null && !setting.has(icao.toLowerCase())) { 
                SetEventEmit({
                    Event: `onFilteredICAO`,
                    Metadata: define
                }); 
                return true 
            }
            if (key === 'IgnoredICAO' && setting.size > 0 && icao != null && setting.has(icao.toLowerCase())) { 
                SetEventEmit({
                    Event: `onIgnoredICAO`,
                    Metadata: define
                }); 
                return true 
            }
            if (key === 'ListeningUGC' && setting.size > 0 && zones.length > 0 && !zones.some((ugc: string) => setting.has(ugc.toLowerCase()))) { 
                SetEventEmit({
                    Event: `onFilteredUGC`,
                    Metadata: define
                }); 
                return true 
            }
            if (key === 'ListeningStates' && setting.size > 0 && zones.length > 0 && !zones.some((ugc: string) => setting.has(ugc.substring(0, 2).toLowerCase()))) { 
                SetEventEmit({
                    Event: `onFilteredState`,
                    Metadata: define
                }); 
                return true 
            }
        }
        return false
    }

    const filtering = events.filter((event: TypeEvent) => {
        Bootstrap.Cache.Parsed = Bootstrap.Cache.Parsed.filter((e) => e !== event);
        const define = GetEventSignature(event) as TypeEvent;
        const pre = {...define,properties: {...define.properties,  metadata: {...define.properties.metadata }}};
        const properties = define.properties; delete pre.properties.metadata.ms; delete pre.properties.metadata.header;
        const enhanced = properties.event = GetEventEnhancedName(event)
        const filtered = isFiltered(define)
        if (!filtered) {
            const tick2 = performance.now();
            const geometry = !bools?.DisableGeometryParsing ? GetEventGeometry({ Event: event }) : null;
            const population = GetEventPopulation(geometry)
            const attachments = GetEventAttachments(event)
            event.geometry = geometry;
            event.properties.geocode.census.population = population.population;
            event.properties.geocode.census.cities = population.cities;
            properties.metadata.attachments = attachments;
            SetDebug({ Title: `Filtered`, Message: `${Math.round(performance.now() - tick2)}ms` })
        }
        properties.metadata.hash = createHash("sha256").update(JSON.stringify(pre)).digest("hex")  
        SetEventEmit({ Event: `onProductType${enhanced.replace(/\s+/g, '')}`, Metadata: define });
        return !filtered
    })
    
    SetDebug({ Title: `ValidateEvents (${filtering.length}/${events.length})`, Message: `${Math.round(performance.now() - tick)}ms` })
    await MakeEvents(filtering)
}