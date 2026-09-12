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

import { TypeStanzaCompiled } from "Types/StanzaCompiled"
import { TypeVTEC } from "Types/VTEC"
import { EnumICAO } from "@Enums/ICAO"
import { Bootstrap } from "@Bootstrap"
import { GetEventTracking } from "@Building/GetEventTracking"
import { VTECExtract } from "@ParsingVTEC/VTECExtract"
import { GetEventTags } from "@Building/GetEventTags"
import { GetEventTheme } from "@Building/GetEventTheme"
import { GetEventDirection } from "@Building/GetEventDirection"
import { GetTextFromProduct } from "@ParsingText/GetTextFromProduct"
import { SetDebug } from "@Utilities/SetDebug"

export const ParseAPI = async (Stanza: TypeStanzaCompiled): Promise<void> => {
    const messages = Object.values(JSON.parse(Stanza.Message).features) as any;
    for (const feature of messages) {
        const tick = performance.now();
        const VTEC = VTECExtract(feature?.properties?.parameters?.VTEC?.[0]) ?? null as TypeVTEC[]
        Bootstrap.Cache.Parsed.push({
            type: `Feature`,
            geometry: {
                type: `Polygon`,
                coordinates: []
            },
            properties: { 
                event: feature?.properties?.event ?? null,
                parent: feature?.properties?.event ?? null,
                status: feature?.properties?.messageType ?? null,
                issued: feature?.properties?.sent ? new Date(feature?.properties?.sent).toISOString() : null,
                expires: feature?.properties?.expires ? new Date(feature?.properties?.expires).toISOString() : null,
                locations: feature?.properties?.areaDesc ?? null,
                locations_array: feature?.properties?.areaDesc ? feature?.properties?.areaDesc.split('; ') : [],
                regions: [...new Set(
                    feature?.properties?.geocode?.UGC?.map((ugc: string) => ugc.match(/^([A-Z]{2})[CZ](\d{3})$/)?.[1])
                    .filter(Boolean) ?? []
                )] as string[],
                regions_string: (() => {
                    const abbrs = [...new Set(feature?.properties?.geocode?.UGC?.map((l: string) => l.match(/^([A-Z]{2})[CZ](\d{3})$/)?.[1]).filter(Boolean) ?? [])];
                    return abbrs.length ? abbrs.join(`-`) : null;
                })(),
                description: feature?.properties?.description ?? null,
                attributes: feature?.properties?.attributes ?? {},
                theme: GetEventTheme(feature?.properties?.event),
                geocode: {
                    office: {
                        office: VTEC ? VTEC?.[0]?.Tracking.split(`.`)[0] : null,
                        name: EnumICAO[VTEC ? VTEC?.[0]?.Tracking.split(`.`)[0] : null] ?? null,
                    },
                    organization:  feature?.properties?.parameters?.WMOidentifier?.[0],
                    ugc: feature?.properties?.geocode?.UGC ?? [], 
                    census: {
                        population: null,
                        cities: []
                    },
                    polygon: feature?.geometry?.coordinates.length > 0 ? Buffer.from(JSON.stringify([feature?.geometry?.coordinates[0]])).toString('base64') : null,
                    polygon_generated: feature?.geometry?.coordinates.length > 0 ? true : false,
                },
                parameters: {
                    tags: GetEventTags(feature?.properties?.description),
                    instructions: feature?.properties?.instruction ?? null,
                    source: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`SOURCE...`], Removal: [`.`]}) ?? null,
                    hazards: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`HAZARD...`], Removal: [`.`]}) ?? null,
                    impacts: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`IMPACT...`], Removal: [`.`]}) ?? null,
                    estimated_hail_size: feature?.properties?.parameters?.maxHailSize?.[0] ?? null,
                    estimated_wind_gusts: feature?.properties?.parameters?.maxWindGust?.[0] ?? null,
                    direction: GetEventDirection(feature?.properties?.description) ?? null,
                    damage_threat: feature?.properties?.parameters?.thunderstormDamageThreat?.[0] ?? null,
                    tornado_threat: feature?.properties?.parameters?.tornadoDetection?.[0] ?? null,
                    flood_threat: feature?.properties?.parameters?.flashFloodDamageThreat?.[0] ?? null,
                    wind_threat: feature?.properties?.parameters?.windThreat?.[0] ?? null,
                    hail_threat: feature?.properties?.parameters?.hailThreat?.[0] ?? null,
                },
                discussion_parameters: {
                    discussion_number: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`Mesoscale Discussion `], Removal: [`Mesoscale Discussion`, `Number`, `...`] })?.toString()?.padStart(4, "0") ?? null,
                    discussion_concerning: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`Concerning...`] }) ?? null,
                    discussion_max_tornado: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`MOST PROBABLE PEAK TORNADO INTENSITY...`] }) ?? null,
                    discussion_max_hail: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`MOST PROBABLE PEAK HAIL SIZE...`] }) ?? null,
                    discussion_max_wind: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`MOST PROBABLE PEAK WIND GUST...`] }) ?? null,
                    discussion_watch_issuance: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`Probability of Watch Issuance...`], Removal: [`percent`]}) ?? null,
                },
                watch_parameters: {
                    watch_number: (VTEC?.[0]?.Watch) && (GetTextFromProduct({ Message: feature?.properties?.description, Find: [`ITIES FOR`, `UPDATE FOR`, `Watch Number `], Removal: [`%`, `<`, `:`] })?.replace(/(WT|WS|)/g, '')?.trim()?.toString()?.padStart(4, "0") ?? VTEC?.[0]?.Tracking?.slice(-4)?.toString()?.padStart(4, "0") ?? null),
                    watch_type: feature?.properties?.description.includes(`TORNADO WATCH`) ? `Tornado` : feature?.properties?.description.includes(`SEVERE`) ? `Severe` : null,
                    additional_tornadoes_probability: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`PROB OF 2 OR MORE TORNADOES`], Removal: [`%`, `<`, `:`] }) ?? null,
                    strong_tornadoes_probability: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`PROB OF 1 OR MORE STRONG /EF2-EF5/ TORNADOES`], Removal: [`%`, `<`, `:`] }) ?? null,
                    severe_wind_probability: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`PROB OF 10 OR MORE SEVERE WIND EVENTS`], Removal: [`%`, `<`, `:`] }) ?? null,
                    severe_hail_probability: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`PROB OF 10 OR MORE SEVERE HAIL EVENTS`], Removal: [`%`, `<`, `:`] }) ?? null,
                    hail_2in_probability: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`PROB OF 1 OR MORE HAIL EVENTS >= 2 INCHES`], Removal: [`%`, `<`, `:`] }) ?? null,
                    combined_hail_wind_probability: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`PROB OF 6 OR MORE COMBINED SEVERE HAIL/WIND EVENTS`], Removal: [`%`, `<`, `:`] }) ?? null,
                    max_hail_in: GetTextFromProduct({ Message: feature?.properties?.description, Find: [`MAX HAIL /INCHES/`], Removal: [`%`, `<`, `:`] }) ?? null,
                    max_wind_surface:  GetTextFromProduct({ Message: feature?.properties?.description, Find: [`MAX WIND GUSTS SURFACE /KNOTS/`], Removal: [`%`, `<`, `:`] }) ?? null,
                    max_tops_x100feet:  GetTextFromProduct({ Message: feature?.properties?.description, Find: [`MAX TOPS /X 100 FEET/`], Removal: [`%`, `<`, `:`] }) ?? null,
                    pds_watch: (GetTextFromProduct({ Message: feature?.properties?.description, Find: [`PARTICULARLY DANGEROUS SITUATION`], Removal: [`%`, `<`, `:`] }) === `YES`)
                },
                metadata: {
                    ms: performance.now() - tick,
                    source: `events.api`,
                    tracking: GetEventTracking({ Type: `API`, WMO: { Identifier: feature?.properties?.parameters?.WMOidentifier?.[0], ID: feature?.id}, VTEC: VTEC?.[0]}),
                    header: `ZCZC-ATMOSX-${feature?.properties?.parameters?.WMOidentifier}`,
                    vtec: VTEC?.[0],
                    hvtec: null,
                    raw: feature?.properties?.description,
                    history: [
                        {
                            description: feature?.properties?.description,
                            issued: feature?.properties?.sent ? new Date(feature?.properties?.sent).toISOString() : null,
                            status: feature?.properties?.messageType ?? null,
                        }
                    ]
                }
            }
        })
        SetDebug({ Title: `ParseAPI`, Message: `${Math.round(performance.now() - tick)}ms` })
    }
}