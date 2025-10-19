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
import Utils from './utils';
import Xmpp from './xmpp';
import StanzaParser from './parsers/stanza';
import Database from './database';
import EAS from './eas';
import EventParser from './parsers/events';
import TextParser from './parsers/text';
import VtecParser from './parsers/vtec';
import UGCParser from './parsers/ugc';

export class AlertManager { 
    isNoaaWeatherWireService: boolean
    job: any
    constructor(metadata: types.ClientSettings) { this.start(metadata) }

    /**
     * setDisplayName allows you to set or update the nickname of the client for identification purposes.
     * This does require you to restart the XMPP client if you are using NoaaWeatherWireService for primary data.
     * Changing this setting does not affect the username used for authentication.
     * 
     * @public
     * @param {?string} [name] 
     */
    public setDisplayName(name?: string) {
        const settings = loader.settings as types.ClientSettings;
        const trimmed = name?.trim();
        if (!trimmed) {
            Utils.warn(loader.definitions.messages.invalid_nickname);
            return;
        }
        settings.NoaaWeatherWireService.clientCredentials.nickname = trimmed;
    }

    /**
     * This will set custom coordinates based on given paramters and key name. This will be used to 
     * get the distance between each alert at a given coord in either miles or kilometers.
     *
     * @public
     * @param {string} locationName 
     * @param {?types.Coordinates} [coordinates] 
     */
    public setCurrentLocation(locationName: string, coordinates?: types.Coordinates): void {
        if (!coordinates) {
            Utils.warn(`Coordinates not provided for location: ${locationName}`);
            return;
        }
        const { lat, lon } = coordinates;
        if (typeof lat !== 'number' || typeof lon !== 'number' || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            Utils.warn(loader.definitions.messages.invalid_coordinates.replace('{lat}', String(lat)).replace('{lon}', String(lon)));
            return;
        }
        loader.cache.currentLocations[locationName] = coordinates;
    }


    /**
     * createEasAudio generates EAS audio files based on the provided description and header information.
     *
     * @public
     * @async
     * @param {string} description 
     * @param {string} header 
     * @returns {unknown} 
     */
    public async createEasAudio(description: string, header: string) {
        return await EAS.generateEASAudio(description, header);
    }

    /**
     * getAllAlertTypes provides a comprehensive list of all possible alert event and action combinations
     *
     * @public
     * @returns {{}} 
     */
    public getAllAlertTypes(): string[] {
        const events = new Set(Object.values(loader.definitions.events));
        const actions = new Set(Object.values(loader.definitions.actions));
        return Array.from(events).flatMap(event =>
            Array.from(actions).map(action => `${event} ${action}`)
        );
    }

    /**
     * searchAlertDatbase allows you to search the internal alert database for previously received alerts up to 50,000 records.
     *
     * @public
     * @async
     * @param {string} query 
     * @param {number} [limit=250]
     * @returns {unknown} 
     */
    public async searchStanzaDatabase(query: string, limit: number = 250) {
        const escapeLike = (s: string) => s.replace(/[%_]/g, '\\$&');
        const rows = await loader.cache.db
            .prepare(`SELECT * FROM stanzas WHERE stanza LIKE ? ESCAPE '\\' ORDER BY id DESC LIMIT ${limit}`)
            .all(`%${escapeLike(query)}%`);
        return rows;
    }

    /**
     * setSettings allow you to dynamically update the settings of the AlertManager instance. This doesn't
     * require a refresh of the instance. However, if you are switching to NWWS->NWS or vice versa,
     * you will need to call stop() and then start() for changes to take effect.
     *
     * @public
     * @async
     * @param {types.ClientSettings} settings 
     * @returns {Promise<void>} 
     */
    public async setSettings(settings: types.ClientSettings) {
        Utils.mergeClientSettings(loader.settings, settings);
    }

    /**
     * "on" allows the client to listen for specific events emitted by the parser.
     * Events include:
     * - onAlerts: Emitted when a batch of new alerts have been fully parsed
     * - onMessage: Emitted when a raw CAP/XML has been parsed by the StanzaParser
     * - onConnection: Emitted when the XMPP client connects successfully
     * - onReconnect: Emitted when the XMPP client is attempting to reconnect
     * - onOccupant: Emitted when an occupant joins or leaves the XMPP MUC room (NWWS only)
     * - onAnyEventType (Ex. onTornadoWarning) Emitted when a specific alert event type is received
     * 
     * @public
     * @param {string} event 
     * @param {(...args: any[]) => void} callback 
     * @returns {() => void}
     */
    public on(event: string, callback: (...args: any[]) => void) {
        loader.cache.events.on(event, callback);
        return () => loader.cache.events.off(event, callback);
    }
    
    /**
     * start initializes the AlertManager instance, setting up necessary configurations and connections.
     * This method must be called before the instance can begin processing alerts.
     *
     * @public
     * @async
     * @param {Record<string, string>} [metadata={}] 
     * @returns {Promise<void>} 
     */
    public async start(metadata: types.ClientSettings): Promise<void> {
        if (!loader.cache.isReady) { 
            Utils.warn(loader.definitions.messages.not_ready);
            return;
        }
        this.setSettings(metadata);
        const settings = loader.settings as types.ClientSettings;
        this.isNoaaWeatherWireService = settings.isNWWS;
        loader.cache.isReady = false;
        while (!Utils.isReadyToProcess(settings.global.alertFiltering.locationFiltering?.filter ?? false)) {
            await Utils.sleep(2000);
        }
        if (this.isNoaaWeatherWireService) {
            try {
                await Database.loadDatabase();
                await Xmpp.deploySession();
                await Utils.loadCollectionCache();
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                Utils.warn(`Failed to initialize NWWS services: ${msg}`);
            }
        }
        Utils.handleCronJob(this.isNoaaWeatherWireService);
        if (this.job) {
            try { this.job.stop(); } catch { Utils.warn(`Failed to stop existing cron job.`); }
            this.job = null;
        }
        const interval = !this.isNoaaWeatherWireService ? settings.NationalWeatherService.checkInterval : 5;
        this.job = new loader.packages.jobs.Cron(`*/${interval} * * * * *`, () => { 
            Utils.handleCronJob(this.isNoaaWeatherWireService);
        });
    }


    /**
     * stop terminates the AlertManager instance, closing any active connections and cleaning up resources.
     *
     * @public
     * @async
     * @returns {Promise<void>}
     */
    public async stop(): Promise<void> {
        loader.cache.isReady = true;
        if (this.job) {
            try { this.job.stop(); } catch { Utils.warn(`Failed to stop cron job.`); }
            this.job = null;
        }
        const session = loader.cache.session;
        if (session && this.isNoaaWeatherWireService) {
            try { await session.stop(); } catch { Utils.warn(`Failed to stop XMPP session.`); }
            loader.cache.sigHalt = true;
            loader.cache.isConnected = false;
            loader.cache.session = null;
            this.isNoaaWeatherWireService = false;
        }
    }

}

export default AlertManager;
export { StanzaParser, EventParser, TextParser, VtecParser, UGCParser, EAS, Database, Utils };