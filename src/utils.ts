/*
                                            _               _     __   __
         /\  | |                           | |             (_)    \ \ / /
        /  \ | |_ _ __ ___   ___  ___ _ __ | |__   ___ _ __ _  ___ \ V / 
       / /\ \| __| "_ ` _ \ / _ \/ __| "_ \| "_ \ / _ \ "__| |/ __| > <  
      / ____ \ |_| | | | | | (_) \__ \ |_) | | | |  __/ |  | | (__ / . \ 
     /_/    \_\__|_| |_| |_|\___/|___/ .__/|_| |_|\___|_|  |_|\___/_/ \_\
                                     | |                                 
                                     |_|                                                                                                                
    
    Written by: KiyoWx (k3yomi)                
*/


import * as loader from './bootstrap';
import * as types from './types';
import StanzaParser from './parsers/stanza';
import EventParser from './parsers/events';
import Xmpp from './xmpp';

export class Utils { 
    
    /**
     * @function sleep
     * @description
     *     Pauses execution for a specified number of milliseconds.
     *
     * @static
     * @async
     * @param {number} ms
     * @returns {Promise<void>}
     */
    public static async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * @function warn
     * @description
     *     Emits a log event and prints a warning to the console. Throttles repeated
     *     warnings within a short interval unless `force` is `true`.
     *
     * @static
     * @param {string} message
     * @param {boolean} [force=false]
     */
    public static warn(message: string, force: boolean = false) {
        loader.cache.events.emit('log', message)
        if (!loader.settings.journal) return;
        if (loader.cache.lastWarn != null && (Date.now() - loader.cache.lastWarn < 500) && !force) return;
        loader.cache.lastWarn = Date.now();
        console.warn(`\x1b[33m[ATMOSX-PARSER]\x1b[0m [${new Date().toLocaleString()}] ${message}`);
    }

    /**
     * @function loadCollectionCache
     * @description
     *     Loads cached NWWS messages from disk, validates them, and passes them
     *     to the event parser. Honors CAP preferences and ignores empty or
     *     incompatible files.
     *
     * @static
     * @async
     */
    public static async loadCollectionCache() {
        try {
            const settings = loader.settings as types.ClientSettingsTypes;
            if (settings.noaa_weather_wire_service_settings.cache.enabled && settings.noaa_weather_wire_service_settings.cache.directory) {
                if (!loader.packages.fs.existsSync(settings.noaa_weather_wire_service_settings.cache.directory)) return;
                const cacheDir = settings.noaa_weather_wire_service_settings.cache.directory;
                const getAllFiles = loader.packages.fs.readdirSync(cacheDir).filter((file: string) => file.endsWith('.bin') && file.startsWith('cache-'));
                this.warn(loader.definitions.messages.dump_cache.replace(`{count}`, getAllFiles.length.toString()), true);
                for (const file of getAllFiles) {
                    const filepath = loader.packages.path.join(cacheDir, file);
                    const readFile = loader.packages.fs.readFileSync(filepath, { encoding: 'utf-8' });
                    const readSize = loader.packages.fs.statSync(filepath).size;
                    if (readSize == 0) { continue; }
                    const isCap = readFile.includes(`<?xml`);
                    if (isCap && !settings.noaa_weather_wire_service_settings.preferences.cap_only) continue;
                    if (!isCap && settings.noaa_weather_wire_service_settings.preferences.cap_only) continue;
                    const validate = StanzaParser.validate(readFile, { isCap: isCap, raw: true });
                    EventParser.eventHandler(validate);
                }
                this.warn(loader.definitions.messages.dump_cache_complete, true);
            }
        } catch (error: any) {
            Utils.warn(`Failed to load cache: ${error.stack}`);
        }
    }

    /**
     * @function loadGeoJsonData
     * @description
     *     Fetches GeoJSON data from the National Weather Service endpoint and
     *     passes it to the event parser for processing.
     *
     * @static
     * @async
     */
    public static async loadGeoJsonData() {
        try {
            const settings = loader.settings as types.ClientSettingsTypes;
            const response = await this.createHttpRequest<types.GenericHTTPResponse >(
                settings.national_weather_service_settings.endpoint
            );
            if (response.error) return;
            EventParser.eventHandler({
                message: JSON.stringify(response.message),
                attributes: {},
                isCap: true,
                isApi: true,
                isPVtec: false,
                isUGC: false,
                isCapDescription: false,
                awipsType: { type: 'api', prefix: 'AP' },
                ignore: false
            });
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            Utils.warn(`Failed to load National Weather Service GeoJSON Data: ${msg}`);
        }
    }

    /**
     * @function createHttpRequest
     * @description
     *     Performs an HTTP GET request with default headers and timeout, returning
     *     either the response data or an error message.
     *
     * @static
     * @template T
     * @param {string} url
     * @param {types.HTTPSettings} [options]
     * @returns {Promise<{ error: boolean; message: T | string }>}
     */
    public static async createHttpRequest<T = unknown>(url: string, options?: types.HTTPSettings): Promise<{ error: boolean; message: T | string }> {
        const defaultOptions = { 
            timeout: 10000,
            headers: { 
                "User-Agent": "AtmosphericX",
                "Accept": "application/geo+json, text/plain, */*; q=0.9",
                "Accept-Language": "en-US,en;q=0.9"
            }
        };
        const requestOptions = {
            ...defaultOptions,
            ...options,
            headers: { ...defaultOptions.headers, ...(options?.headers ?? {}) }
        };
        try {
            const resp = await loader.packages.axios.get<T>(url, {
                headers: requestOptions.headers,
                timeout: requestOptions.timeout,
                maxRedirects: 0,
                validateStatus: (status) => status === 200 || status === 500
            });
            return { error: false, message: resp.data };
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            return { error: true, message: msg };
        }
    }

    /**
     * @function garbageCollectionCache
     * @description
     *     Deletes cache files exceeding the specified size limit to free disk space.
     *     Recursively traverses the cache directory and removes files larger than
     *     the given maximum.
     *
     * @static
     * @param {number} maxFileMegabytes
     */
    public static garbageCollectionCache(maxFileMegabytes: number) {
        try {
            const settings = loader.settings as types.ClientSettingsTypes;
            const cacheDir = settings.noaa_weather_wire_service_settings.cache.directory;
            if (!cacheDir) return;
            const { fs, path } = loader.packages;
            if (!fs.existsSync(cacheDir)) return;
            const maxBytes = maxFileMegabytes * 1024 * 1024;
            const stackDirs: string[] = [cacheDir];
            const files: { file: string; size: number }[] = [];
            while (stackDirs.length) {
                const currentDir = stackDirs.pop()!;
                fs.readdirSync(currentDir).forEach(file => {
                    const fullPath = path.join(currentDir, file);
                    const stat = fs.statSync(fullPath);
                    if (stat.isDirectory()) stackDirs.push(fullPath);
                    else files.push({ file: fullPath, size: stat.size });
                });
            }
            files.forEach(f => {
                if (f.size > maxBytes) fs.unlinkSync(f.file);
            });
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            Utils.warn(`Failed to perform garbage collection: ${msg}`);
        }
    }

    /**
     * @function handleCronJob
     * @description
     *     Performs scheduled tasks for NWWS XMPP session maintenance or GeoJSON data
     *     updates depending on the job type.
     *
     * @static
     * @param {boolean} isWire
     */
    public static handleCronJob(isWire: boolean) {
        try {
            const settings = loader.settings as types.ClientSettingsTypes;
            const cache = settings.noaa_weather_wire_service_settings.cache;
            const reconnections = settings.noaa_weather_wire_service_settings.reconnection_settings;
            if (isWire) {
                if (cache.enabled) {
                    void this.garbageCollectionCache(cache.max_file_size);
                }
                if (reconnections.enabled) {
                    void Xmpp.isSessionReconnectionEligible(reconnections.interval);
                }
            } else {
                void this.loadGeoJsonData();
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            Utils.warn(`Failed to perform scheduled tasks (${isWire ? 'NWWS' : 'GeoJSON'}): ${msg}`);
        }
    }

    /**
     * @function mergeClientSettings
     * @description
     *     Recursively merges a ClientSettings object into a target object,
     *     preserving nested structures and overriding existing values.
     *
     * @static
     * @param {Record<string, unknown>} target
     * @param {types.ClientSettingsTypes} settings
     * @returns {Record<string, unknown>}
     */
    public static mergeClientSettings(target: Record<string, unknown>, settings: types.ClientSettingsTypes): Record<string, unknown> {
        for (const key in settings) {
            if (!Object.prototype.hasOwnProperty.call(settings, key)) continue;
            const value = settings[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
                    target[key] = {};
                }
                this.mergeClientSettings(target[key] as Record<string, unknown>, value as types.ClientSettingsTypes);
            } else {
                target[key] = value;
            }
        }
        return target;
    }

    /**
     * @function calculateDistance
     * @description
     *     Calculates the great-circle distance between two geographic coordinates
     *     using the haversine formula.
     *
     * @static
     * @param {types.Coordinates} coord1
     * @param {types.Coordinates} coord2
     * @param {'miles' | 'kilometers'} [unit='miles']
     * @returns {number}
     */
    public static calculateDistance(coord1: types.Coordinates, coord2: types.Coordinates, unit: 'miles' | 'kilometers' = 'miles'): number {
        if (!coord1 || !coord2) return 0;
        const { lat: lat1, lon: lon1 } = coord1;
        const { lat: lat2, lon: lon2 } = coord2;
        if ([lat1, lon1, lat2, lon2].some(v => typeof v !== 'number')) return 0;
        const toRad = (deg: number) => deg * Math.PI / 180;
        const R = unit === 'miles' ? 3958.8 : 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 100) / 100;
    }

    /**
     * @function isReadyToProcess
     * @description
     *     Determines whether processing can continue based on the current
     *     tracked locations and filter state. Emits limited warnings if no
     *     locations are available.
     *
     * @static
     * @param {boolean} isFiltering
     * @returns {boolean}
     */
    public static isReadyToProcess(isFiltering: boolean): boolean {
        const totalTracks = Object.keys(loader.cache.currentLocations).length;
        if (totalTracks > 0) {
            loader.cache.totalLocationWarns = 0;
            return true;
        }
        if (!isFiltering) return true;
        if (loader.cache.totalLocationWarns < 3) {
            Utils.warn(loader.definitions.messages.no_current_locations);
            loader.cache.totalLocationWarns++;
            return false;
        }
        Utils.warn(loader.definitions.messages.disabled_location_warning, true);
        return true;
    }
}

export default Utils;