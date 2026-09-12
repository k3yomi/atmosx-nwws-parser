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
import { ReconnectXMPP } from "@XMPP/ReconnectXMPP"
import { Bootstrap } from "@Bootstrap"
import { CreateHttp } from "@Utilities/CreateHttp"
import { SetEventEmit } from "@Utilities/SetEventEmit"
import { CreateEvent } from "@Building/CreateEvent"
import { readdirSync, unlinkSync, statSync, rmdirSync, existsSync } from "fs"
import { join } from "path"

export const SetCronSchedule = async (): Promise<void> => {
    const settings = Bootstrap.Settings as TypeSettings;

    const TTL = settings.GlobalSettings.ArchiveSettings.TTL
    const TTLCUT = Date.now() - TTL * 1000;

    const walk = (dir: string, deleteFolder = false): void => {
        if (!existsSync(dir)) return;
        const entries = readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath, deleteFolder);
                continue;
            }
            const stats = statSync(fullPath);
            if (stats.mtime.getTime() < TTLCUT) {
                try {
                    unlinkSync(fullPath);
                } catch (err) {
                    console.error(`Failed to delete ${fullPath}:`, err);
                }
            }
        }
        if (deleteFolder) {
            try {
                if (readdirSync(dir).length === 0 && statSync(dir).mtime.getTime() < TTLCUT) {
                    rmdirSync(dir);
                }
            } catch (err) {
                console.error(`Failed to delete directory ${dir}:`, err);
            }
        }
    };
    walk(settings.GlobalSettings.ArchiveSettings.TextDirectory, true)
    walk(settings.GlobalSettings.ArchiveSettings.AudioDirectory, true)
    walk(settings.GlobalSettings.ArchiveSettings.JSONDirectory, true)
    walk(settings.GlobalSettings.ArchiveSettings.ImageDirectory, true)



    if (settings.EnableWireService) {
        if (settings.NOAAWeatherWireServiceSettings.ReconnectionSettings.Enabled) {
            void ReconnectXMPP(settings.NOAAWeatherWireServiceSettings.ReconnectionSettings.ReconnectionInterval)
        }
    } else { 
        const response = await CreateHttp({
            URL: settings.NationalWeatherServiceSettings.EventsEndpoint,
            Headers: {
                "User-Agent": "@atmosx/event-product-parser"
            }
        })
        if (response.error) {
            return SetEventEmit({
                Event: `onServiceStatus`,
                Metadata: {
                    type: "fetch-api",
                    message: `Failed to fetch latest events from National Weather Service API - ${response.message}`,
                    data: {},
                    error: true
                },
            })
        }
        SetEventEmit({
            Event: `onServiceStatus`,
            Metadata: {
                Message: `Fetched latest events from National Weather Service API`,
                Data: {},
                Type: "fetch-api",
                Error: false
            },
        })
        await CreateEvent({ Message: response.message, NWWS: false })
    }
}


