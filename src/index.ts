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
import PVtecParser from './parsers/pvtec';
import HVtecParser from './parsers/hvtec';
import UGCParser from './parsers/ugc';

export class AlertManager { 
    isNoaaWeatherWireService: boolean
    job: any
    constructor(metadata: types.ClientSettingsTypes) { this.start(metadata) }
    
    /**
     * @function setDisplayName
     * @description
     *     Sets the display nickname for the NWWS XMPP session. Trims the provided
     *     name and validates it, emitting a warning if the name is empty or invalid.
     *
     * @param {string} [name]
     */
    public setDisplayName(name?: string) {
        const settings = loader.settings as types.ClientSettingsTypes;
        const trimmed = name?.trim();
        if (!trimmed) {
            Utils.warn(loader.definitions.messages.invalid_nickname);
            return;
        }
        settings.noaa_weather_wire_service_settings.credentials.nickname = trimmed;
    }

    /**
     * @function createEasAudio
     * @description
     *     Generates an EAS (Emergency Alert System) audio file using the provided
     *     description and header.
     *
     * @async
     * @param {string} description
     * @param {string} header
     * @returns {Promise<Buffer>}
     */
    public async createEasAudio(description: string, header: string) {
        return await EAS.generateEASAudio(description, header);
    }

    /**
     * @function getAllAlertTypes
     * @description
     *     Generates a list of all possible alert types by combining defined
     *     event names with action names.
     *
     * @returns {string[]}
     */
    public getAllAlertTypes(): string[] {
        const events = new Set(Object.values(loader.definitions.events));
        const actions = new Set(Object.values(loader.definitions.actions));
        return Array.from(events).flatMap(event =>
            Array.from(actions).map(action => `${event} ${action}`)
        );
    }

    /**
     * @function searchStanzaDatabase
     * @description
     *     Searches the stanza database for entries containing the specified query.
     *     Escapes SQL wildcard characters and returns results in descending order
     *     by ID, up to the specified limit.
     *
     * @async
     * @param {string} query
     * @param {number} [limit=250]
     * @returns {Promise<any[]>}
     */
    public async searchStanzaDatabase(query: string, limit: number = 250) {
        const escapeLike = (s: string) => s.replace(/[%_]/g, '\\$&');
        const rows = await loader.cache.db
            .prepare(`SELECT * FROM stanzas WHERE stanza LIKE ? ESCAPE '\\' ORDER BY id DESC LIMIT ${limit}`)
            .all(`%${escapeLike(query)}%`);
        return rows;
    }

    /**
     * @function setSettings
     * @description
     *     Merges the provided client settings into the current configuration,
     *     preserving nested structures.
     *
     * @async
     * @param {types.ClientSettingsTypes} settings
     * @returns {Promise<void>}
     */
    public async setSettings(settings: types.ClientSettingsTypes) {
        Utils.mergeClientSettings(loader.settings, settings);
    }

    /**
     * @function on
     * @description
     *     Registers a callback for a specific event and returns a function
     *     to unregister the listener.
     *
     * @param {string} event
     * @param {(...args: any[]) => void} callback
     * @returns {() => void}
     */
    public on(event: string, callback: (...args: any[]) => void) {
        loader.cache.events.on(event, callback);
        return () => loader.cache.events.off(event, callback);
    }

    /**
     * @function start
     * @description
     *     Initializes the client with the provided settings, starts the NWWS XMPP
     *     session if applicable, loads cached messages, and sets up scheduled
     *     tasks (cron jobs) for ongoing processing.
     *
     * @async
     * @param {types.ClientSettingsTypes} metadata
     * @returns {Promise<void>}
     */
    public async start(metadata: types.ClientSettingsTypes): Promise<void> {
        if (!loader.cache.isReady) { 
            Utils.warn(loader.definitions.messages.not_ready);
            return;
        }
        this.setSettings(metadata);
        const settings = loader.settings as types.ClientSettingsTypes;
        this.isNoaaWeatherWireService = settings.is_wire;
        loader.cache.isReady = false;
        await Database.loadDatabase();
        if (this.isNoaaWeatherWireService) {
            (async () => {
                try {
                    await Xmpp.deploySession();
                    await Utils.loadCollectionCache();
                } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : String(err);
                    Utils.warn(`Failed to initialize NWWS services: ${msg}`);
                }
            })();
        }
        Utils.handleCronJob(this.isNoaaWeatherWireService);
        if (this.job) {
            try { this.job.stop(); } catch { Utils.warn(`Failed to stop existing cron job.`); }
            this.job = null;
        }
        const interval = !this.isNoaaWeatherWireService ? settings.national_weather_service_settings.interval : 5;
        this.job = new loader.packages.jobs.Cron(`*/${interval} * * * * *`, () => { 
            Utils.handleCronJob(this.isNoaaWeatherWireService);
        });
    }

    /**
     * @function stop
     * @description
     *     Stops active scheduled tasks (cron job) and, if connected, the NWWS
     *     XMPP session. Updates relevant cache flags to indicate the session
     *     is no longer active.
     *
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
export { StanzaParser, EventParser, TextParser, PVtecParser, HVtecParser, UGCParser, EAS, Database, Utils };