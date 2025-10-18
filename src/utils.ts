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
            }
        } catch (error: any) {
            loader.cache.events.emit('onError', { code: 'error-load-cache', message: `Failed to load cache: ${error.message}`});
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
            const response = await this.createHttpRequest(settings.NationalWeatherService.endpoint) as types.NationalWeatherServiceResponse
            if (!response.error) { 
                EventParser.eventHandler({message: JSON.stringify(response.message), attributes: {}, isCap: true, isApi: true, isVtec: false, isUGC: false, isCapDescription: false, awipsType: { type: 'api', prefix: 'AP' }, ignore: false});
            }
        } catch (error: any) {
            loader.cache.events.emit('onError', { code: 'error-fetching-nws-data', message: `Failed to fetch NWS data: ${error.message}`});
        }
    }

    /**
     * detectUncaughtExceptions sets up a global handler for uncaught exceptions in the Node.js process,
     *
     * @public
     * @static
     */
    public static detectUncaughtExceptions() {
        if (loader.cache.events.listenerCount('uncaughtException') > 0) return;
        process.on('uncaughtException', (error: Error) => {
            loader.cache.events.emit(`onError`, {message: `Uncaught Exception: ${error.message}`, code: `error-uncaught-exception`, stack: error.stack});
        });
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
    public static async createHttpRequest(url: string, options?: types.HTTPSettings) {
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
            const resp = await loader.packages.axios.get(url, {
                headers: requestOptions.headers,
                timeout: requestOptions.timeout,
                maxRedirects: 0,
                validateStatus: (status) => status === 200 || status === 500
            });
            return { error: false, message: resp.data };
        } catch (err: any) {
            return { error: true, message: err?.message ?? String(err) };
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
            if (!settings.NoaaWeatherWireService.cache.directory) return;
            if (!loader.packages.fs.existsSync(settings.NoaaWeatherWireService.cache.directory)) return;
            const maxBytes = maxFileMegabytes * 1024 * 1024;
            const cacheDirectory = settings.NoaaWeatherWireService.cache.directory;
            const stackFiles: string[] = [cacheDirectory], files: { 
                file: string,
                size: number,
            }[] = [];
            while (stackFiles.length) { 
                const currentDirectory = stackFiles.pop();
                loader.packages.fs.readdirSync(currentDirectory).forEach((file: string) => {
                    const fullPath = loader.packages.path.join(currentDirectory, file);
                    const stat = loader.packages.fs.statSync(fullPath)
                    if (stat.isDirectory()) stackFiles.push(fullPath) ;
                    else files.push({ file: fullPath, size: stat.size });
                })
            }
            if (!files.length) return;
            files.forEach(f => {
                if (f.size > maxBytes) loader.packages.fs.unlinkSync(f.file);
            })
        } catch (error: any) {
            loader.cache.events.emit('onError', { code: 'error-garbage-collection', message: `Failed to perform garbage collection: ${error.message}`});
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
            if (isNwws) { 
                if (settings.NoaaWeatherWireService.cache.read ) void this.garbageCollectionCache(settings.NoaaWeatherWireService.cache.maxSizeMB);
                if (settings.NoaaWeatherWireService.clientReconnections.canReconnect ) void Xmpp.isSessionReconnectionEligible(settings.NoaaWeatherWireService.clientReconnections.currentInterval);
            } else {
                void this.loadGeoJsonData();
            }
        } catch (error: any) {
            loader.cache.events.emit('onError', { code: 'error-cron-job', message: `Failed to perform scheduled tasks: ${error.message}`});
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
    public static mergeClientSettings(target: Record<string, any>, settings: Record<string, any>) {
        for (const key in settings) {
            if (settings.hasOwnProperty(key)) {
                if (typeof settings[key] === 'object' && settings[key] !== null && !Array.isArray(settings[key])) {
                    if (!target[key] || typeof target[key] !== 'object') { target[key] = {};  }
                    this.mergeClientSettings(target[key], settings[key]);
                } else {
                    target[key] = settings[key];
                }
            }
        }
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
    public static calculateDistance(coord1: types.Coordinates, coord2: types.Coordinates, unit: 'miles' | 'kilometers' = 'miles') {
        if (!coord1 || !coord2) return 0;
        const { lat: lat1, lon: lon1 } = coord1;
        const { lat: lat2, lon: lon2 } = coord2;
        const toRad = (deg: number) => deg * Math.PI / 180;
        const earthRadius = unit === 'miles' ? 3958.8 : 6371;
        let dLat = toRad(lat2 - lat1);
        let dLon = toRad(lon2 - lon1);
        if (dLon > Math.PI) dLon -= 2 * Math.PI;
        if (dLon < -Math.PI) dLon += 2 * Math.PI;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c;
        return Number(distance.toFixed(2));
    }
}

export default Utils;