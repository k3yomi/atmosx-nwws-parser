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
import { EnumGlobalFilter } from "@Enums/GlobalFilter"
import { Bootstrap } from "@Bootstrap"
import { CreateTasks } from "@Tasks/CreateTasks"
import { SetHash } from "@Manager/SetHash"
import { UpdateNode } from "@Manager/UpdateNode"
import { SetEventEmit } from "@Utilities/SetEventEmit"
import { SetTimeoutAction } from "@Utilities/SetTimeoutAction"
import { GetStringText } from "@Utilities/GetStringText"

export const MakeEvents = async (events: TypeEvent[]): Promise<void> => {
    let tasked = [] as TypeEvent[];
    const settings = Bootstrap.Settings as TypeSettings;
    if (events.length === 0) return
    await Promise.all(events.map(async event => {
        const features = Bootstrap.Cache.Events.features;
        const getHash = event.properties.metadata.hash;
        const getTracking = event.properties.metadata.tracking;
        const isEntry = Bootstrap.Cache.Hashes?.find(hash => hash.Tracking === getTracking)
        const isHashed = isEntry?.Hashes?.includes(getHash) ?? false;
        const isNodeFiltering = settings.GlobalSettings.EventFiltering.NodeLocationFiltering
        const getNodes = Bootstrap.Cache.Nodes.features;
        const getFeature = features.find(feature => feature.properties.metadata.tracking === getTracking);    

        if (isHashed || event.properties.status_metadata.is_expired) return
        SetHash({ Event: event, Entry: isEntry })
        await UpdateNode(event);
        if (isNodeFiltering && getNodes.length > 0) {
            if (!event.properties.metadata.filtered_proximity && !EnumGlobalFilter.includes(event.properties.event.toLowerCase())) { 
                return
            }
        }
        
        const isRatelimited = SetTimeoutAction({ Identifier: getTracking, Interval: 1, Max: 1, AddTime: true })
        const isLocal = event.properties.metadata.filtered_proximity ? `[LOCAL] ` : ``;
        if (!isRatelimited.Limited) {
            SetEventEmit({
                Event: `onEventStatus`,
                Metadata: {
                    Type: getFeature ? `Updated` : `New`,
                    Event: event
                },
                Tree: Bootstrap.Settings.EnhancedEventJournaling ? GetStringText(event).split('\n').filter(line => line.trim() !== '') : [],
                Message: `${isLocal}[${getFeature ? 'Updated' : 'New'}] ${event.properties.event} (${event.properties.status}) (${event.properties.metadata.tracking})`
            })
        }

        if (settings.GlobalSettings.EventManagement) {
            if (event.properties.status_metadata.is_issued || event.properties.status_metadata.is_updated) {
                if (getFeature) { 
                    const getIndex = features.indexOf(getFeature);
                    const cHistory = getFeature?.properties?.metadata?.history ?? [];
                    const iHistory = event.properties?.metadata?.history ?? [];
                    const mHistory = [...cHistory, ...iHistory].filter((v, i, a) => a.indexOf(v) === i).filter((v, i, a) => a.findIndex(h => h.description === v.description && h.issued === v.issued) === i);
        
                    Bootstrap.Cache.Events.features[getIndex] = {
                        ...event,
                        properties: {
                            ...event.properties,
                            metadata: {
                                ...event?.properties?.metadata,
                                history: mHistory
                            },
                        }
                    };

                    tasked.push(Bootstrap.Cache.Events.features[getIndex])
                } else { 
                    features.push(event);
                    tasked.push(event)
                }
            }
        }
    }))
    SetEventEmit({ Event: `onEventCache`, Metadata: Bootstrap.Cache.Events, Limited: true })
    return await CreateTasks(tasked)
}