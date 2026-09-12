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

import { TypeEventProperties } from "StaticTypes/Properties"
import { TypeAttributes } from "StaticTypes/Attributes"
import { TypeUGC } from "Types/UGC"
import { TypeVTEC } from "Types/VTEC"
import { EnumExpressions } from "@Enums/Expressions"
import { GetDescriptionFromProduct } from "@ParsingText/GetDescriptionFromProduct"
import { GetPolygonFromProduct } from "@ParsingText/GetPolygonFromProduct"
import { GetTextFromProduct } from "@ParsingText/GetTextFromProduct"
import { GetEventOffice } from "@Building/GetEventOffice"
import { GetEventTags } from "@Building/GetEventTags"
import { GetEventDirection } from "@Building/GetEventDirection"

interface GetEventPropertiesOptions { 
    Message: string
    Attributes: TypeAttributes
    UGC?: TypeUGC
    VTEC?: TypeVTEC
}

export const GetEventProperties = ({ Message, Attributes, UGC, VTEC }: GetEventPropertiesOptions): TypeEventProperties => {
    const organization = Message.match(EnumExpressions.wmo)?.[0] ?? null
    const polygons = GetPolygonFromProduct(Message)
    const properties = {
        locations: UGC?.Locations?.join(`; `) ?? null,
        locations_array: UGC?.Locations ?? [],
        regions: [...new Set(
            UGC?.Zones
            ?.map((location: string) => location.match(/^([A-Z]{2})[CZ](\d{3})$/)?.[1])
            .filter(Boolean) ?? []
        )],
        regions_string: (() => {
            const abbrs = [...new Set(UGC?.Zones?.map((l: string) => l.match(/^([A-Z]{2})[CZ](\d{3})$/)?.[1]).filter(Boolean) ?? [])];
            return abbrs.length ? abbrs.join(`-`) : null;
        })(),
        description: GetDescriptionFromProduct({ Message: Message, Handle: VTEC?.Raw ?? null }),
        attributes: Attributes,
        geocode: {
            office: GetEventOffice({ Attributes: Attributes, Organization: organization, VTEC: VTEC }),
            organization: organization,
            ugc: UGC?.Zones ?? [],
            census: {},
            polygon: polygons.length > 0 ? Buffer.from(JSON.stringify([polygons])).toString('base64') : null,
            polygon_generated: polygons.length > 0 ? true : false
        },
        parameters: {
            tags: GetEventTags(Message),
            instructions: GetTextFromProduct({ Message: Message, Find: [`For your protection`, `do not`, `use extreme caution`], Append: `...`, Removal: [`.`]})  ?? null,
            source: GetTextFromProduct({ Message: Message, Find: [`SOURCE...`], Removal: [`.`]}) ?? null,
            hazards: GetTextFromProduct({ Message: Message, Find: [`HAZARD...`], Removal: [`.`]}) ?? null,
            impacts: GetTextFromProduct({ Message: Message, Find: [`IMPACT...`], Removal: [`.`]}) ?? null,
            estimated_hail_size: GetTextFromProduct({ Message: Message, Find: [`MAX HAIL SIZE...`, `HAIL...`], Removal: ['in']}) ?? null,
            estimated_wind_gusts: GetTextFromProduct({ Message: Message, Find: [`MAX WIND GUST...`, `WIND...`]}) ?? null,
            direction: GetEventDirection(Message) ?? null,
            damage_threat: GetTextFromProduct({ Message: Message, Find: [`DAMAGE THREAT...`], Removal: []}) ?? null,
            tornado_threat: GetTextFromProduct({ Message: Message, Find: [`TORNADO...`, `WATERSPOUT...`] }) ?? null,
            flood_threat: GetTextFromProduct({ Message: Message, Find: [`FLASH FLOOD...`]}) ?? null,
            wind_threat: GetTextFromProduct({ Message: Message, Find: [`WIND THREAT...`]}) ?? null,
            hail_threat: GetTextFromProduct({ Message: Message, Find: [`HAIL THREAT...`], Removal: []}) ?? null,
        },
        discussion_parameters: {
            discussion_number: GetTextFromProduct({ Message: Message, Find: [`Mesoscale Discussion `], Removal: [`Mesoscale Discussion`, `Number`, `...`] })?.toString()?.padStart(4, "0") ?? null,
            discussion_concerning: GetTextFromProduct({ Message: Message, Find: [`Concerning...`] }) ?? null,
            discussion_max_tornado: GetTextFromProduct({ Message: Message, Find: [`MOST PROBABLE PEAK TORNADO INTENSITY...`] }) ?? null,
            discussion_max_hail: GetTextFromProduct({ Message: Message, Find: [`MOST PROBABLE PEAK HAIL SIZE...`] }) ?? null,
            discussion_max_wind: GetTextFromProduct({ Message: Message, Find: [`MOST PROBABLE PEAK WIND GUST...`] }) ?? null,
            discussion_watch_issuance: GetTextFromProduct({ Message: Message, Find: [`Probability of Watch Issuance...`], Removal: [`percent`]}) ?? null,
        },
        watch_parameters: {
            watch_number: VTEC?.Watch ? ( GetTextFromProduct({ Message: Message, Find: [`ITIES FOR`, `UPDATE FOR`, `Watch Number `], Removal: [`%`, `<`, `:`] })?.replace(/(WT|WS|)/g, '')?.trim()?.toString()?.padStart(4, "0") ?? VTEC?.Tracking?.slice(-4)?.toString()?.padStart(4, "0") ?? null) : null,
            watch_type: Message.includes(`TORNADO WATCH`) ? `Tornado` : Message.includes(`SEVERE`) ? `Severe` : null,
            additional_tornadoes_probability: GetTextFromProduct({ Message: Message, Find: [`PROB OF 2 OR MORE TORNADOES`], Removal: [`%`, `<`, `:`] }) ?? null,
            strong_tornadoes_probability: GetTextFromProduct({ Message: Message, Find: [`PROB OF 1 OR MORE STRONG /EF2-EF5/ TORNADOES`], Removal: [`%`, `<`, `:`] }) ?? null,
            severe_wind_probability: GetTextFromProduct({ Message: Message, Find: [`PROB OF 10 OR MORE SEVERE WIND EVENTS`], Removal: [`%`, `<`, `:`] }) ?? null,
            severe_hail_probability: GetTextFromProduct({ Message: Message, Find: [`PROB OF 10 OR MORE SEVERE HAIL EVENTS`], Removal: [`%`, `<`, `:`] }) ?? null,
            hail_2in_probability: GetTextFromProduct({ Message: Message, Find: [`PROB OF 1 OR MORE HAIL EVENTS >= 2 INCHES`], Removal: [`%`, `<`, `:`] }) ?? null,
            combined_hail_wind_probability: GetTextFromProduct({ Message: Message, Find: [`PROB OF 6 OR MORE COMBINED SEVERE HAIL/WIND EVENTS`], Removal: [`%`, `<`, `:`] }) ?? null,
            max_hail_in: GetTextFromProduct({ Message: Message, Find: [`MAX HAIL /INCHES/`], Removal: [`%`, `<`, `:`] }) ?? null,
            max_wind_surface:  GetTextFromProduct({ Message: Message, Find: [`MAX WIND GUSTS SURFACE /KNOTS/`], Removal: [`%`, `<`, `:`] }) ?? null,
            max_tops_x100feet:  GetTextFromProduct({ Message: Message, Find: [`MAX TOPS /X 100 FEET/`], Removal: [`%`, `<`, `:`] }) ?? null,
            pds_watch: (GetTextFromProduct({ Message: Message, Find: [`PARTICULARLY DANGEROUS SITUATION`], Removal: [`%`, `<`, `:`] }) === `YES` ? true : null)
        }
    }
    if (isNaN(Number(properties.watch_parameters.watch_number))) {
        properties.watch_parameters.watch_number = null
    }
    return properties;
}