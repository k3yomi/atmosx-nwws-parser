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
import { Bootstrap } from "@Bootstrap"
import { CreateHttp } from "@Utilities/CreateHttp";
import { SetDebug } from "@Utilities/SetDebug";

interface TaskSendNTFYOptions {
    Event: TypeEvent
    Priority: string | number
    Body: string
    Topic: string
}

export const TaskSendNTFY = async function({ Event, Priority, Body, Topic }: TaskSendNTFYOptions): Promise<void> { 
    const { properties } = Event;

    const configurations = Bootstrap.Settings.NotifyServer;
    const authentication = configurations?.Credentials?.Username && configurations?.Credentials?.Password ? { 
        Username: configurations.Credentials.Username, 
        Password: configurations.Credentials.Password 
    } : undefined;

    const image = configurations?.MediaStorage?.IMAGE ? { link: `${configurations?.MediaStorage?.IMAGE}/${properties.regions_string}//${properties?.event}_${properties?.metadata?.tracking}.png` } : undefined;
    const SPCGraphic = properties?.metadata?.attachments?.find(a => a.name === "Image: SPC Graphic") 
        
    const buttons = [
        ...(configurations?.MediaStorage?.AUDIO ? [{
            "action": "view",
            "label": "View Audio",
            "url": `${configurations.MediaStorage.AUDIO}/${properties.regions_string}/${properties.event}_${properties.metadata.tracking}.wav`,
        }] : []),
        ...(configurations?.MediaStorage?.TEXT ? [{
            "action": "view",
            "label": "View Text",
            "url": `${configurations.MediaStorage.TEXT}/${properties.regions_string}/${properties.event}_${properties.metadata.tracking}.txt`,
        }] : []),
        ...(SPCGraphic ? [{
            "action": "view",
            "label": "View Graphic",
            "url": SPCGraphic.link,
        }] : []),
        ... [{
            "action": "copy",
            "label": "Copy Card",
            "value": `${properties.event} (${properties.status})\n${Body}\nTags: ${properties.parameters.tags?.join(",") ?? "N/A"}`
        }]
    ];

    const headers = {
        "Title": `${properties.event} (${properties.status})`,
        "Tags": properties.parameters.tags?.join(",") ?? "N/A",
        "Priority": Priority ?? "5",
        ...(image && { "Attach": image.link }),
        ...(buttons.length > 0 && { "Actions": JSON.stringify(buttons) }),
    };

    const post = async (topic: string) => {
        const response = await CreateHttp({
            URL: `${configurations?.Server?.replace(/\/$/, "")}/${topic}`,
            Timeout: 15_000,
            Method: "PUT",
            ...(authentication && { Auth: authentication }),
            Headers: headers,
            Body: Body
        })
        if (response.error) { 
            SetDebug({ Title: `Tasks/NTFY`, Message: `Failed to send notification to topic "${topic}": ${response.message}` })
        }
    }

    const topics = [
        Topic,
        ...(properties.metadata.filtered_proximity ? [`${Topic}-LOCAL`] : []),
    ];

    await Promise.all([...new Set(topics)].map(post));
}