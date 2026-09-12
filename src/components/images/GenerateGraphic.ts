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

import { EnumStates, EnumZones } from "@Enums/States"
import { TypeEvent } from "StaticTypes/Event"
import { Bootstrap } from "@Bootstrap"
import { GetStringText } from "@Utilities/GetStringText"
import { GetEventGeometry } from "@Building/GetEventGeometry"
import { GetGeographicalEvents } from "@ImageModules/GetGeographicalEvents"
import { GetUnionPolygon } from "@Utilities/GetUnionPolygon"
import { GetGeographicalBoundaries } from "@ImageModules/GetGeographicalBoundaries"
import { GetGeographicalCities } from "@ImageModules/GetGeographicalCities"
import { GetParsedBoundary } from "@ImageModules/GetParsedBoundary"
import { GetSVGPath } from "@ImageModules/GetSVGPath"
import { CreateSVG } from "@ImageModules/CreateSVG"
import { GetGeometryBounds } from "@ImageModules/GetGeometryBounds"
import { geoBounds, geoMercator, geoPath } from "d3-geo"
import { mkdir, readFile } from "fs/promises"
import { join } from "path";
import sharp from "sharp"

interface GenerateGraphicOptions { 
    Regions?: string[]
    IgnoredRegions?: string[]
    Event?: TypeEvent
    File?: { 
        Directory?: string
        Name?: string
    }
    MaxMiles?: number
    Width?: number
    Height?: number
}

export const GenerateGraphic = async ({ File, Regions, Event, MaxMiles = 350, Width = 1200, Height = 675 }: GenerateGraphicOptions): Promise<string> => {
    let polygons: GeoJSON.Polygon | GeoJSON.MultiPolygon | null
    let icon: string | null;
    let renders: any = {
        cities: null,
        states: null,
        counties: null,
    };
    let pathing: any = {
        cities: null,
        events: null,
        counties: null,
        states: null, 
    }

    const A = [EnumStates, EnumZones].reduce((acc, obj) => ({ ...acc, ...obj }), {});
    const B = [`HI`, `AK`];
    const { coordinates } = Event?.geometry ?? {};
    const { properties } = Event ?? {};
    const { regions, theme, event } = properties ?? {};
    const inConus = Event ? regions?.every(state => A[state] && !B.includes(state)) : true;
    const R = (Regions ?? null)?.length
        ? [...new Set(Regions ?? null)]
        : null;
    const E = GetGeographicalEvents({ Regions: R, Event: Event });
    if (inConus || !Event) {
        const boundaries = GetGeographicalBoundaries({ Regions: R });
        const cities = GetGeographicalCities({ Regions: R });
        renders.cities = cities.cities.filter(city => city.population >= 5e3).sort((a, b) => b.population - a.population).filter((city, index, cities) => {
            return !cities.slice(0, index).some(other => {
                const dist = Math.sqrt(
                    Math.pow(city.lat - other.lat, 2) +
                    Math.pow(city.lon - other.lon, 2)
                );
                return dist < (Event || Regions ? 0.4 : 3);
            });
        });
        renders.states = GetParsedBoundary(boundaries.states);
        renders.counties = GetParsedBoundary(boundaries.counties);
    }

    if (Event) { 
        polygons = (coordinates.length > 0) ? Event.geometry : await GetEventGeometry({ Event });
        if (polygons.coordinates.length == 0) { return null; }
        if (inConus) {
            const eBounds = GetGeometryBounds({ Geometry: polygons, Padding: MaxMiles });
            renders.counties = renders?.counties?.filter((county: GeoJSON.Feature<GeoJSON.Polygon>) => {
                const cBounds = GetGeometryBounds({ Geometry: county.geometry, Padding: MaxMiles });
                return ( cBounds.Bounds.minLon <= eBounds.Search.maxLon && cBounds.Bounds.maxLon >= eBounds.Search.minLon && cBounds.Bounds.minLat <= eBounds.Search.maxLat && cBounds.Bounds.maxLat >= eBounds.Search.minLat );
            });
            renders.states = renders?.states?.filter((state: GeoJSON.Feature<GeoJSON.Polygon>) => {
                const sBounds = GetGeometryBounds({ Geometry: state.geometry, Padding: MaxMiles });
                return ( sBounds.Bounds.minLon <= eBounds.Search.maxLon && sBounds.Bounds.maxLon >= eBounds.Search.minLon && sBounds.Bounds.minLat <= eBounds.Search.maxLat && sBounds.Bounds.maxLat >= eBounds.Search.minLat );
            });
            renders.cities = renders?.cities?.filter((city: { lat: number; lon: number }) => {
                return ( city.lat >= eBounds.Search.minLat && city.lat <= eBounds.Search.maxLat && city.lon >= eBounds.Search.minLon && city.lon <= eBounds.Search.maxLon );
            });
        }
    }

    const iMode = geoMercator();
    const iPath = geoPath().projection(iMode);
    const jFeatures: GeoJSON.Feature[] = [...renders?.states ?? [], ...renders?.counties ?? []];
    const jCollection: GeoJSON.FeatureCollection = { type: `FeatureCollection`, features: jFeatures };
    const events = (await Promise.all(
        E.map(async (event: TypeEvent) => {
            const zones = event.properties?.geocode?.ugc ?? [];
            if (zones?.length === 0) return null;
            return {event, polygon: await GetUnionPolygon({ 
                Polygons: polygons ? [polygons.coordinates] : [await GetEventGeometry({ Event: event }).coordinates],
            })};
        })
    )).filter(Boolean);

    if (polygons) {
        let geometry = polygons;
        const geo = {
            type: "FeatureCollection",
            features: [{ type: "Feature", geometry, properties: {} }]
        };
        const bounds = geoBounds(geo as any);
        if (bounds[0][0] === -180 && bounds[0][1] === -90 && bounds[1][0] === 180 && bounds[1][1] === 90) {
            if (geometry.type === "Polygon") {
                geometry = { ...geometry, coordinates: geometry.coordinates.map((ring) => [...ring].reverse())};
            } else if (geometry.type === "MultiPolygon") {
                geometry = {...geometry, coordinates: geometry.coordinates.map((polygon) => polygon.map((ring) => [...ring].reverse()))};
            }
            geo.features[0].geometry = geometry;
        }
        iMode.fitExtent([[150, 150], [Width - 150, Height - 150]], geo as any);
    } else {
        iMode.fitExtent( [[60, 60], [Width - 60, Height - 60]], jCollection);
    }

    pathing.events = events?.map(({ event, polygon: polys }) => {
        const color = event?.properties?.theme ?? theme ?? `rgb(56, 72, 88)`;
        return GetSVGPath({ 
            Polygons: polys, 
            IPath: iPath, 
            Map: false,
            Settings: { BorderColor: `${color}`, BorderWidth: 2, FillColor: `${color}`, FillOpacity: 0.1 } 
        });
    }).filter(Boolean).join(``);

    pathing.counties = renders?.counties?.map((polygon: GeoJSON.Feature) => GetSVGPath({ 
        Polygons: polygon.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon, 
        IPath: iPath,
        Map: true,
        Settings: { BorderColor: `darkgray`, BorderWidth: 0.5, FillColor: `black`, FillOpacity: 1 } 
    })).filter(Boolean).join(``);

    pathing.states = renders?.states?.map((polygon: GeoJSON.Feature) => GetSVGPath({ 
        Polygons: polygon.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon,
        IPath: iPath, 
        Map: false,
        Settings: { BorderColor: `white`, BorderWidth: 1, FillColor: `#ffffff`, FillOpacity: 0 } 
    })).filter(Boolean).join(``);

    pathing.cities = renders?.cities?.map((city: { lat: number; lon: number; name: string; population: number }) => {
        const point = iMode([city.lon, city.lat]);
        const [x, y] = point;
        const radius = 2 * Math.max(0.75, Math.min(1.5, Width / 1000));
        return `
            <circle cx="${x}" cy="${y}" r="${radius}" fill="#ffffff" />
            <text x="${x}" y="${y + radius + 9}" fill="#ffffff" font-size="${Math.max(10, Math.min(10, Width / 140))}px" font-family="Arial, sans-serif" font-weight="500" text-anchor="middle" dominant-baseline="middle" stroke="#000000" stroke-width="2.5" stroke-opacity="0.7" paint-order="stroke" >${city.name}</text>
        `;
    }).join(``);

    const title = Event
        ? (event ?? `Event`)
        : (R?.length > 0 ? `Region: ${R.map(state => EnumStates[state] ?? state).join(`, `)}` : `Contiguous United States`);
    const subtitleLines = Event
        ? GetStringText(Event).split(`\n`).filter(line => line.trim().length > 0).slice(0, 10)
        : [`Last Updated: ${new Date().toLocaleString()}`];
    const scale = Math.max(0.75, Math.min(1.0, Width / 1000));
    const titleSize = Math.round(17 * scale);
    const lineSize = Math.round(13 * scale);
    const lineHeight = Math.round(15 * scale);
    const paddingX = Math.round(16 * scale);
    const paddingTop = Math.round(16 * scale);
    const paddingBottom = Math.round(16 * scale);
    const accentWidth = Math.max(4, Math.round(5 * scale));
    const iconSize = Math.round(Math.min(122, Math.max(48, Width * 0.07)) * scale);
    const hasIcon = Boolean(Bootstrap?.Settings?.GlobalSettings?.ArchiveSettings?.Logo);

    if (hasIcon) {
        const buffer = await readFile(Bootstrap.Settings.GlobalSettings.ArchiveSettings.Logo);
        icon = `data:image/png;base64,${Buffer.from(buffer).toString(`base64`)}`;
    }

    const boxWidth = Math.min(Math.round(Width * 0.4), Width - Math.round(28 * scale));
    const textStartX = paddingX + accentWidth + Math.round(6 * scale);
    const textEndPadding = hasIcon ? iconSize + Math.round(20 * scale) : Math.round(16 * scale);
    const availableTextWidth = boxWidth - textStartX - textEndPadding;
    const maxTitleChars = Math.max(20, Math.floor(availableTextWidth / (titleSize * 0.52)));
    const maxLineChars = Math.max(24, Math.floor(availableTextWidth / (lineSize * 0.52)));

    const titleY = paddingTop + titleSize;
    const firstLineY = titleY + Math.round(22 * scale);
    const contentHeight = firstLineY + (subtitleLines.length * lineHeight) + paddingBottom;
    const boxHeight = Math.max(contentHeight, hasIcon ? paddingTop + iconSize + paddingBottom : contentHeight);

    const iconX = boxWidth - iconSize - Math.round(5 * scale);
    const iconY = paddingTop;

    const SVG = CreateSVG({
        Width, Height,
        MapFeatures: !inConus ? [pathing.events] : [pathing.counties, pathing.states, pathing.events, pathing.cities],
        Features: [
            `<rect x="${Math.round(9 * scale)}" y="${Math.round(10 * scale)}" width="${boxWidth}" height="${boxHeight}"  fill="rgba(0, 0, 0, 0.57)" />`,
            `<rect x="${Math.round(6 * scale)}" y="${Math.round(7 * scale)}" width="${boxWidth}" height="${boxHeight}" fill="rgba(16, 18, 24, 0.36)" stroke="rgba(255,255,255,0.12)" stroke-width="${Math.max(1, scale)}" />`,
            `<rect x="${Math.round(6 * scale)}" y="${Math.round(7 * scale)}" width="${accentWidth}" height="${boxHeight}" fill="${theme ?? `rgb(56, 72, 88)`}" />`,
            hasIcon && icon
                ? `<image href="${icon}" x="${iconX}" y="${iconY}" width="${iconSize}" height="${iconSize}" preserveAspectRatio="xMidYMid meet" opacity="0.95" />`
                : ``,
            `<text x="${textStartX}" y="${titleY}" text-anchor="start" font-family="Arial, sans-serif" font-size="${titleSize}" font-weight="700" fill="white">${title.length > maxTitleChars ? title.slice(0, maxTitleChars - 3) + `...` : title}</text>`,
            ...subtitleLines.map((line, i) =>
                `<text x="${textStartX}" y="${firstLineY + (i * lineHeight)}" text-anchor="start" font-family="Arial, sans-serif" font-size="${lineSize}" fill="rgba(255,255,255,0.82)">${line.length > maxLineChars ? line.slice(0, maxLineChars - 3) + `...` : line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>`
            ),
            `<text x="${textStartX}" y="${boxHeight - Math.round(5 * scale)}" text-anchor="start" font-family="Arial, sans-serif" font-size="${Math.max(8, Math.min(8, Width / 140))}px" fill="rgba(255,255,255,0.82)" >This graphic was created by AtmosphericX and is not an official NOAA graphic.</text>`
        ]
    });

    const { Directory, Name } = File ?? {};
    const dir = Directory ?? Bootstrap.Settings?.GlobalSettings?.ArchiveSettings?.ImageDirectory;
    const name = Name ?? event ?? `img`;
    await mkdir(dir, { recursive: true });
    await sharp(Buffer.from(SVG))
        .png()
        .toFile(join(dir, `${name}${name.includes(`.png`) ? `` : `.png`}`));
    return dir + `/${name}${name.includes(`.png`) ? `` : `.png`}`; 
}