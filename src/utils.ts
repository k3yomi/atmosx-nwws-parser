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
     * Zzzzzzz... yeah not much to explain here. Simple sleep function that returns a promise after the specified milliseconds.
     *
     * @public
     * @static
     * @async
     * @param {number} ms 
     * @returns {Promise<void>} 
     */
    public static async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * warn logs a warning message to the console with a standardized format.
     *
     * @public
     * @static
     * @param {string} message 
     */
    public static warn(message: string, force: boolean = false) {
        loader.cache.events.emit('log', message)
        if (!loader.settings.journal) return;
        if (loader.cache.lastWarn != null && (Date.now() - loader.cache.lastWarn < 500) && !force) return;
        loader.cache.lastWarn = Date.now();
        console.warn(`\x1b[33m[ATMOSX-PARSER]\x1b[0m [${new Date().toLocaleString()}] ${message}`);
    }
    
    /**
     * loadCollectionCache reads cached alert files from the specified cache directory and processes them.
     *
     * @public
     * @static
     * @async
     * @returns {Promise<void>} 
     */
    public static async loadCollectionCache() {
        try {
            const settings = loader.settings as types.ClientSettings;
            if (settings.NoaaWeatherWireService.cache.read && settings.NoaaWeatherWireService.cache.directory) {
                if (!loader.packages.fs.existsSync(settings.NoaaWeatherWireService.cache.directory)) return;
                const cacheDir = settings.NoaaWeatherWireService.cache.directory;
                const getAllFiles = loader.packages.fs.readdirSync(cacheDir).filter((file: string) => file.endsWith('.bin') && file.startsWith('cache-'));
                this.warn(loader.definitions.messages.dump_cache.replace(`{count}`, getAllFiles.length.toString()), true);
                await this.sleep(2000);
                for (const file of getAllFiles) {
                    const filepath = loader.packages.path.join(cacheDir, file);
                    const readFile = loader.packages.fs.readFileSync(filepath, { encoding: 'utf-8' });
                    const readSize = loader.packages.fs.statSync(filepath).size;
                    if (readSize == 0) { continue; }
                    const isCap = readFile.includes(`<?xml`);
                    if (isCap && !settings.NoaaWeatherWireService.alertPreferences.isCapOnly) continue;
                    if (!isCap && settings.NoaaWeatherWireService.alertPreferences.isCapOnly) continue;
                    const validate = StanzaParser.validate(readFile, { awipsid: file, isCap: isCap, raw: true, issue: undefined });
                    await EventParser.eventHandler(validate);
                }
                this.warn(loader.definitions.messages.dump_cache_complete, true);
            }
        } catch (error: any) {
            Utils.warn(`Failed to load cache: ${error.message}`);
        }
    }

    /**
     * loadGeoJsonData fetches GeoJSON data from the National Weather Service endpoint and processes each alert.
     *
     * @public
     * @static
     * @async
     * @returns {Promise<void>} 
     */
    public static async loadGeoJsonData() {
        try {
            const settings = loader.settings as types.ClientSettings;
            const response = await this.createHttpRequest<types.NationalWeatherServiceResponse>(
                settings.NationalWeatherService.endpoint
            );
            if (response.error) return;
            EventParser.eventHandler({
                message: JSON.stringify(response.message),
                attributes: {},
                isCap: true,
                isApi: true,
                isVtec: false,
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
     * createHttpRequest performs an HTTP GET request to the specified URL with optional settings.
     *
     * @public
     * @static
     * @async
     * @param {string} url 
     * @param {?types.HTTPSettings} [options] 
     * @returns {unknown} 
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
     * garbageCollectionCache removes files from the cache directory that exceed the specified maximum file size in megabytes.
     *
     * @public
     * @static
     * @param {number} maxFileMegabytes 
     */
    public static garbageCollectionCache(maxFileMegabytes: number) {
        try {
            const settings = loader.settings as types.ClientSettings;
            const cacheDir = settings.NoaaWeatherWireService.cache.directory;
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
     * handleCronJob performs periodic tasks based on whether the client is connected to NWWS or fetching data from NWS.
     *
     * @public
     * @static
     * @param {boolean} isNwws 
     */ 
    public static handleCronJob(isNwws: boolean) {
        try {
            const settings = loader.settings as types.ClientSettings;
            const cache = settings.NoaaWeatherWireService.cache;
            const reconnections = settings.NoaaWeatherWireService.clientReconnections;
            if (isNwws) {
                if (cache.read) {
                    void this.garbageCollectionCache(cache.maxSizeMB);
                }
                if (reconnections.canReconnect) {
                    void Xmpp.isSessionReconnectionEligible(reconnections.currentInterval);
                }
            } else {
                void this.loadGeoJsonData();
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            Utils.warn(`Failed to perform scheduled tasks (${isNwws ? 'NWWS' : 'GeoJSON'}): ${msg}`);
        }
    }


    /**
     * mergeClientSettings merges user-provided settings into the existing client settings, allowing for nested objects to be merged correctly.
     *
     * @public
     * @static
     * @param {Record<string, any>} target 
     * @param {Record<string, any>} settings 
     */
    public static mergeClientSettings(target: Record<string, unknown>, settings: types.ClientSettings): Record<string, unknown> {
        for (const key in settings) {
            if (!Object.prototype.hasOwnProperty.call(settings, key)) continue;
            const value = settings[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
                    target[key] = {};
                }
                this.mergeClientSettings(target[key] as Record<string, unknown>, value as types.ClientSettings);
            } else {
                target[key] = value;
            }
        }
        return target;
    }


    /**
     * Calculate the distance between 2 given coordinates.
     *
     * @public
     * @static
     * @async
     * @param {types.Coordinates} coord1 
     * @param {types.Coordinates} coord2 
     * @param {('miles' | 'kilometers')} [unit='miles'] 
     * @returns {Promise<number>} 
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
     * validateEventReady checks if there are current locations set when location filtering is enabled, and manages warning messages accordingly.
     *
     * @public
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