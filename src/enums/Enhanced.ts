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

type EnhancedEventType = {
    description?: string
    append?: boolean
    tornado?: string
    damage?: string
    pdswatch?: boolean
}

export const EnumEnhanced: Record<string, Record<string, EnhancedEventType>> = {
    "Tornado Warning": {
        "Tornado Emergency": { description: "tornado emergency" },
        "PDS Tornado Warning": { description: "particularly dangerous situation", damage: `CONSIDERABLE` },
        "Radar Confirmed Tornado Warning": { description: "source...radar confirmed tornado.", tornado: `OBSERVED` },
        "Confirmed Tornado Warning": { tornado: `OBSERVED` },
        "Radar Indicated Tornado Warning": { },
    },
    "Fire Weather Warning": {
        "PDS Fire Weather Warning": { description: "particularly dangerous situation" },
    },
    "Blizzard Warning": {
        "PDS Blizzard Warning": { description: "particularly dangerous situation" },
    },
    "Ice Storm Warning": {
        "PDS Ice Storm Warning": { description: "particularly dangerous situation" },
    },
    "Special Marine Warning": {
        "Special Marine Warning (WPROB)": { tornado: `POSSIBLE` },
        "Special Marine Warning (WCONF)": { tornado: `OBSERVED` },
    },
    "Tornado Watch": {
        "PDS Tornado Watch": { pdswatch: true }
    },
    "Severe Thunderstorm Watch": {
        "PDS Severe Thunderstorm Watch": { pdswatch: true }
    },
    "Flash Flood Warning": {
        "Flash Flood Emergency": { description: "flash flood emergency" },
        "Considerable Flash Flood Warning": { damage: `CONSIDERABLE` },
    },
    "Severe Thunderstorm Warning": {
        "EDS Severe Thunderstorm Warning (TPROB)": { description: "extremely dangerous situation", tornado: "POSSIBLE" },
        "EDS Severe Thunderstorm Warning": { description: "extremely dangerous situation" },
        "Destructive Severe Thunderstorm Warning (TPROB)": { damage: `DESTRUCTIVE`, tornado: `POSSIBLE` },
        "Destructive Severe Thunderstorm Warning": { damage: `DESTRUCTIVE` },
        "Considerable Severe Thunderstorm Warning (TPROB)": { damage: `CONSIDERABLE`, tornado: `POSSIBLE` },
        "Considerable Severe Thunderstorm Warning": { damage: `CONSIDERABLE` },
        "Severe Thunderstorm Warning (TPROB)": { tornado: `POSSIBLE` },
    },
    "Special Weather Statement": {
        "Convective Special Weather Statement": { description: "strong thunderstorm" },
    }
}