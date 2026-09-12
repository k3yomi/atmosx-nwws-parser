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

import { TypeSettings } from "Types/Settings"
import { TypeEvent } from "StaticTypes/Event"
import { TypeActions } from "Types/Actions"
import { Bootstrap } from "@Bootstrap"
import { SetDebug } from "@Utilities/SetDebug"
import { GetMatched } from "@Utilities/GetMatched"
import { GetStringText } from "@Utilities/GetStringText"
import { GetCleanedEvent } from "@Building/GetCleanedEvent"
import { GenerateAudioMessage } from "@Audio/GenerateAudioMessage"
import { TaskGenerateText } from "@Tasks/TaskGenerateText"
import { TaskGenerateJSON } from "@Tasks/TaskGenerateJSON"
import { TaskSendNTFY } from "@Tasks/TaskSendNTFY"
import { TaskSendWebhook } from "@Tasks/TaskSendWebhook"
import { GenerateGraphic } from "@Image/GenerateGraphic"
import { QueueManager } from "@Utilities/QueueManager"

const Webhooks = new QueueManager({ Concurrency: 1 });
const NTFY = new QueueManager({ Concurrency: 5 });

export const CreateTasks = async (events: TypeEvent[]): Promise<void> => {
    
    const settings = Bootstrap.Settings as TypeSettings;
    const { ActionSettings, GlobalSettings, NotifyServer } = settings;
    const actions = ActionSettings as TypeActions[];
    for (const event of events) {
        const tick = performance.now()
        const { properties } = event;
        const isActioning = Array.isArray(actions) && actions.length > 0;
        if (!isActioning) { continue }
        for (const action of actions) {
            const { Events, Webhook, NotificationServer, Uploads } = action;
            const isValidAction = GetMatched({ Strings: Events, String: properties.event });
       
            if ((Events.length == 0 || isValidAction)) {
                const a = performance.now();
                const [audio, text, json, image] = await Promise.all([
                    Uploads?.AUDIO && GlobalSettings?.ArchiveSettings?.AudioDirectory ? GenerateAudioMessage({
                        Directory: GlobalSettings?.ArchiveSettings?.AudioDirectory + `/${properties?.regions_string ?? `MC`}`,
                        Title: (`${properties.event}_${properties.metadata.tracking}`).replace(/[\\:*?"<>|]/g, "_").replace(/\s+/g, " ").trim(),
                        Message: properties.description,
                        Header: properties.metadata.header
                    }).then((result) => { return result; }) : Promise.resolve(null),

                    Uploads?.TEXT && GlobalSettings?.ArchiveSettings?.TextDirectory ? TaskGenerateText({
                        String: properties.metadata.raw,
                        Directory: GlobalSettings?.ArchiveSettings?.TextDirectory + `/${properties?.regions_string ?? `MC`}`,
                        Filename: (`${properties.event}_${properties.metadata.tracking}.txt`).replace(/[\\:*?"<>|]/g, "_").replace(/\s+/g, " ").trim()
                    }).then((result) => { return result; }) : Promise.resolve(null),

                    Uploads?.JSON && GlobalSettings?.ArchiveSettings?.JSONDirectory ? TaskGenerateJSON({
                        String: JSON.stringify(GetCleanedEvent(event), null, 2),
                        Directory: GlobalSettings?.ArchiveSettings?.JSONDirectory + `/${properties?.regions_string ?? `MC`}`,
                        Filename: (`${properties.event}_${properties.metadata.tracking}.json`).replace(/[\\:*?"<>|]/g, "_").replace(/\s+/g, " ").trim()
                    }).then((result) => { return result; }) : Promise.resolve(null),

                    Uploads?.IMAGE && GlobalSettings?.ArchiveSettings?.ImageDirectory ? GenerateGraphic({
                        Event: event,
                        File: {
                            Directory: GlobalSettings?.ArchiveSettings?.ImageDirectory + `/${properties?.regions_string ?? `MC`}`,
                            Name: (`${properties.event}_${properties.metadata.tracking}.png`).replace(/[\\:*?"<>|]/g, "_").replace(/\s+/g, " ").trim()
                        }
                    }).then((result) => { return result; }) : Promise.resolve(null)
                ]);
           

                SetDebug({ Title: `Tasks/Generative`, Message: `${Math.round(performance.now() - a)}ms` })

                const b = performance.now();
                await Promise.all([
                    NotificationServer?.Enabled && NotifyServer?.Enabled && NotificationServer?.Topic ? NTFY.enqueue(() => TaskSendNTFY({
                        Event: event,
                        Priority: NotificationServer?.Priority ?? 5,
                        Body: GetStringText(event),
                        Topic: NotificationServer?.Topic
                    })) : Promise.resolve(null),
                    Webhook?.Enabled && Webhook?.Destination ? Webhooks.enqueue(() => TaskSendWebhook({
                        Event: event,
                        Webhook: {
                            Enabled: Webhook?.Enabled,
                            Destination: Webhook?.Destination,
                            Message: Webhook?.Message,
                            Title: Webhook?.Title,
                            Ratelimit: Webhook?.Ratelimit
                        },
                        Attachments: {
                            Image: image,
                            Text: text,
                            Audio: audio,
                            Json: json
                        }
                    })) : Promise.resolve(null)
                ]);
                SetDebug({ Title: `Tasks/Send`, Message: `${Math.round(performance.now() - b)}ms` })
            }
        }
        SetDebug({ Title: `Tasks/CompletedEventTask`, Message: `${Math.round(performance.now() - tick)}ms` })
    }
}