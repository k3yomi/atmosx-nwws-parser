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
import { CreateHttp } from "@Utilities/CreateHttp";
import { SetTimeoutAction } from "@Utilities/SetTimeoutAction";
import { GetEmbededText } from "@Utilities/GetEmbededText";
import { readFile } from "fs/promises"

interface TaskSendWebhookOptions {
    Event: TypeEvent;
    Webhook: {
        Enabled: boolean;
        Destination: string;
        Message: string;
        Title: string;
        Ratelimit: number;
    };
    Attachments: {
        Image?: string;
        Text?: string;
        Audio?: string;
        Json?: string;
    }
}

export const TaskSendWebhook = async function({ Event, Webhook, Attachments }: TaskSendWebhookOptions): Promise<void> { 
    const { properties } = Event;
    const isRatelimited = SetTimeoutAction({
        Identifier: Webhook.Destination,
        Interval: (Webhook.Ratelimit ?? 2) * 2,
        Max: (Webhook.Ratelimit ?? 2), 
        AddTime: true 
    })
    if (isRatelimited.Limited) { return }
    const newForm = new FormData();
    const newEmbed = {
        title: `${properties.event} (${properties.status})`,
        description: GetEmbededText(Event),
        fields: [] as { name: string, value: string }[],
        color: 16711680,
        thumbnail: Attachments?.Image ? { url: `attachment://${properties.event}_${properties.status}_${properties.metadata.tracking}.png` } : undefined,
        timestamp: new Date().toISOString(),
        footer: { text: Webhook.Title ?? `AtmosphericX` }
    };
    if (properties.description && !properties.status_metadata.is_expired) {
        const description = properties.description.length > 900
            ? properties.description.substring(0, 900) + "\n\n[Message truncated due to length]"
            : properties.description;
        newEmbed.fields.push({
            name: "Description", 
            value: description ? '```' + '\n' + description.split('\n').map(l => l.trim()).filter(Boolean).join('\n') + '\n' + '```' : ""
        });
    }
    if (properties.metadata.attachments?.length > 0) {
        const attachments = properties.metadata.attachments.slice(0, 5);
        newEmbed.fields.push({
            name: "Attachments", 
            value: attachments.map(attachment => `- [${attachment.name.length > 45 ? attachment.name.substring(0, 45) + '...' : attachment.name}](${attachment.link})`).join('\n')
        });
    }

    if (Attachments?.Image) {
        const file = await readFile(Attachments.Image);
        newForm.append("attachmentImage", new Blob([Buffer.from(file)], {type: "image/png"}), `${properties.event}_${properties.status}_${properties.metadata.tracking}.png`)
    }

    if (Attachments?.Text) {
        newForm.append("attachmentText", new Blob([Buffer.from(Attachments.Text)], {type: "application/text"}), `${properties.event}_${properties.status}_${properties.metadata.tracking}.txt`)
    }
    if (Attachments?.Json) {
        newForm.append("attachmentJson", new Blob([Buffer.from(Attachments.Json)], {type: "application/json"}), `${properties.event}_${properties.status}_${properties.metadata.tracking}.json`)
    }
    if (Attachments?.Audio) {
        const file = await readFile(Attachments.Audio);
        newForm.append("attachmentAudio", new Blob([Buffer.from(file)], {type: "application/wav"}), `${properties.event}_${properties.status}_${properties.metadata.tracking}.wav`)
    }

    newForm.append("payload_json", JSON.stringify({ 
        username: Webhook.Title ?? `AtmosphericX`,
        content: Webhook.Message ?? "",
        embeds: [newEmbed]
    }));

    await CreateHttp({
        URL: Webhook.Destination,
        Timeout: 15e3,
        Method: `POST`,
        Body: newForm
    })
}