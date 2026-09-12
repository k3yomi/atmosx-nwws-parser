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

export const GetStringText = (event: TypeEvent): string => {
    const timezone = Bootstrap.Settings.Timezone ?? `UTC`;
    const line = (label: string, value: unknown, condition = true) => condition && value ? `${label} ${value}` : null;
    const isStatement = event.properties.status_metadata.is_statement;
    const isExpired = event.properties.status_metadata.is_expired;
    return [
        line(`Locations:`, event?.properties?.locations?.slice(0, 100)),
        line(`Issued:`, `${new Date(event.properties.issued).toLocaleString([], { timeZone: timezone })} (${(timezone.replace(`America/`, ``))})`, !isExpired),
        line(`Expires:`, `${new Date(event.properties.expires).toLocaleString([], { timeZone: timezone })} (${(timezone.replace(`America/`, ``))})`, !isStatement),
        line(`Damage Threat:`, event?.properties?.parameters?.damage_threat, !isExpired),
        line(`Flood Threat:`, event?.properties?.parameters?.flood_threat, !isExpired),
        line(`Tornado Threat:`, event?.properties?.parameters?.tornado_threat, !isExpired),
        line(`Wind Gusts:`, `${event?.properties?.parameters?.estimated_wind_gusts} ${event?.properties?.parameters?.wind_threat ? ` (${event?.properties?.parameters?.wind_threat})` : ''}`, !isExpired && event?.properties?.parameters?.estimated_wind_gusts != null),
        line(`Hail Size:`, `${event?.properties?.parameters?.estimated_hail_size} ${event?.properties?.parameters?.hail_threat ? ` (${event?.properties?.parameters?.hail_threat})` : ''}`, !isExpired && event?.properties?.parameters?.estimated_hail_size != null),
        line(`Direction:`, event?.properties?.parameters?.direction, !isExpired && event?.properties?.parameters?.direction != null),
        line(`Discussion:`, event?.properties?.discussion_parameters?.discussion_number, !isExpired),
        line(`Concern:`, event?.properties?.discussion_parameters?.discussion_concerning, !isExpired),
        line(`SPC Max Tornado Threat:`, event?.properties?.discussion_parameters?.discussion_max_tornado, !isExpired),
        line(`SPC Max Hail Threat:`, event?.properties?.discussion_parameters?.discussion_max_hail, !isExpired),
        line(`SPC Max Wind Threat:`, event?.properties?.discussion_parameters?.discussion_max_wind, !isExpired),
        line(`SPC Watch Issuance Probability:`, event?.properties?.discussion_parameters?.discussion_watch_issuance ? `${event?.properties?.discussion_parameters?.discussion_watch_issuance}%` : null, !isExpired),
        line(`Watch Number:`, event?.properties?.watch_parameters?.watch_number, !isExpired),
        line(`Strong Tornadoes Probability:`, event?.properties?.watch_parameters?.strong_tornadoes_probability ? `${event?.properties?.watch_parameters?.strong_tornadoes_probability}%` : null, !isExpired),
        line(`Additional Tornadoes Probability:`, event?.properties?.watch_parameters?.additional_tornadoes_probability ? `${event?.properties?.watch_parameters?.additional_tornadoes_probability}%` : null, !isExpired),
        line(`Combined Hail/Wind Probability:`, event?.properties?.watch_parameters?.combined_hail_wind_probability ? `${event?.properties?.watch_parameters?.combined_hail_wind_probability}%` : null, !isExpired),
        line(`Severe Hail Probability:`, event?.properties?.watch_parameters?.severe_hail_probability ? `${event?.properties?.watch_parameters?.severe_hail_probability}%` : null, !isExpired),
        line(`Hail >2in Probability:`, event?.properties?.watch_parameters?.hail_2in_probability ? `${event?.properties?.watch_parameters?.hail_2in_probability}%` : null, !isExpired),
        line(`Max Hail Inches:`, event?.properties?.watch_parameters?.max_hail_in, !isExpired),
        line(`Severe Wind Probability:`, event?.properties?.watch_parameters?.severe_wind_probability ? `${event?.properties?.watch_parameters?.severe_wind_probability}%` : null, !isExpired),
        line(`Max Surface Wind:`, event?.properties?.watch_parameters?.max_wind_surface, !isExpired),
        line(`Max Tops (x100 feet):`, event?.properties?.watch_parameters?.max_tops_x100feet, !isExpired), 
        line(`Sender:`, event?.properties?.geocode?.office?.name ? `${event?.properties?.geocode?.office?.name} (${event?.properties?.geocode?.office?.office})` : event?.properties?.geocode?.office?.office),
        line(`Population:`, event?.properties?.geocode?.census?.population, !isExpired),
        line(`Tracking:`, event?.properties?.metadata?.tracking),
    ].filter(Boolean).join('\n');
}