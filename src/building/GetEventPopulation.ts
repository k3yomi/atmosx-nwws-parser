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

import { TypeCities } from "StaticTypes/Properties"
import { Bootstrap } from "@Bootstrap"
import { CreateQuery } from "@Database/CreateQuery"
import { NormalizePolygon } from "@ImageModules/NormalizePolygon"

interface GetEventPopulationResponse { 
    population: number
    cities: TypeCities[]
}

export const GetEventPopulation = (geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon | null): GetEventPopulationResponse => {
    const coordinates = geometry?.coordinates;
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0 || !Bootstrap.Settings.GlobalSettings.CensusPopulationData) {
        return { population: 0, cities: [] };
    }
    const normalized = NormalizePolygon(geometry) as GeoJSON.Polygon | GeoJSON.MultiPolygon;
    const points = normalized.type === `Polygon` ? normalized.coordinates[0] : normalized.coordinates.flatMap(polygon => polygon[0]);
    const latitudes = points.map(([lon, lat]) => lat);
    const longitudes = points.map(([lon, lat]) => lon);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);
    const A = CreateQuery({
        Query: `SELECT * FROM cities WHERE LAT BETWEEN ? AND ? AND LON BETWEEN ? AND ?`,
        Parameters: [ minLat, maxLat, minLon, maxLon ]
    });
    const population = A.reduce((acc: number, city: any) => {
        const census = Number(city.population);
        return acc + (isNaN(census) ? 0 : census);
    }, 0);
    const cities = A.map((city: any) => ({
        name: city.name,
        state: city.state,
        county: city.county.replace(/ County$/i, ``),
        population: Number(city.population)
    }));
    return { population, cities };
}