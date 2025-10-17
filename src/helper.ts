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
    constructor(metadata: types.ClientSettings) { this.start(metadata) }

    /**
     * setDisplayName allows you to set or update the nickname of the client for identification purposes.
     * This does require you to restart the XMPP client if you are using NoaaWeatherWireService for primary data.
     * Changing this setting does not affect the username used for authentication.
     * 
     * @public
     * @param {?string} [name] 
     */
    public setDisplayName(name?: string): void {
        const settings = loader.settings as types.ClientSettings;
        const trimmed = name?.trim();
        if (!trimmed) {
            loader.cache.events.emit(`onError`, { code: `error-invalid-nickname`, message: loader.definitions.messages.invalid_nickname });
            return;
        }
        settings.NoaaWeatherWireService.clientCredentials.nickname = trimmed;
    }

    /**
     * getAllAlertTypes provides a comprehensive list of all possible alert event and action combinations
     *
     * @public
     * @returns {{}} 
     */
    public getAllAlertTypes() {
        const events = new Set<string>();
        const actions = new Set<string>();
        const combinations: string[] = [];
        Object.values(loader.definitions.events).forEach(event => events.add(event));
        Object.values(loader.definitions.actions).forEach(action => actions.add(action));
        Array.from(events).forEach(event => {
            Array.from(actions).forEach(action => {
                combinations.push(`${event} ${action}`);
            });
        });
        return combinations;
    }

    /**
     * searchAlertDatbase allows you to search the internal alert database for previously received alerts up to 50,000 records.
     *
     * @public
     * @async
     * @param {string} query 
     * @returns {unknown} 
     */
    public async searchStanzaDatabase(query: string) {
        return await loader.cache.db.prepare(`SELECT * FROM stanzas WHERE stanza LIKE ? ORDER BY id DESC LIMIT 250`).all(`%${query}%`)
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
    public async setSettings(settings: types.ClientSettings): Promise<void> {
        Utils.mergeClientSettings(loader.settings, settings);
    }

    /**
     * onEvent allows the client to listen for specific events emitted by the parser.
     * Events include:
     * - onAlerts: Emitted when a batch of new alerts have been fully parsed
     * - onMessage: Emitted when a raw CAP/XML has been parsed by the StanzaParser
     * - onError: Emitted when an error occurs within the parser
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
    public onEvent(event: string, callback: (...args: any[]) => void): () => void {
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
    public async start(metadata: types.ClientSettings): Promise<void>  {
        if (!loader.cache.isReady) { 
            console.log(loader.definitions.messages.not_ready);
            return Promise.resolve();
        }
        this.setSettings(metadata);
        Utils.detectUncaughtExceptions();
        const settings = loader.settings as types.ClientSettings;
        this.isNoaaWeatherWireService = loader.settings.isNWWS
        loader.cache.isReady = false;
        if (this.isNoaaWeatherWireService) {
            await Database.loadDatabase();
            await Xmpp.deploySession();
            await Utils.loadCollectionCache();
        }
        Utils.handleCronJob(this.isNoaaWeatherWireService)
        loader.packages.cron.schedule(`*/${!this.isNoaaWeatherWireService ? settings.NationalWeatherService.checkInterval : 5} * * * * *`, () => { 
            Utils.handleCronJob(this.isNoaaWeatherWireService);
        })
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
        loader.packages.cron.getTasks().forEach((task: any) => task.stop());
        if (loader.cache.session && this.isNoaaWeatherWireService) {
            await loader.cache.session.stop();  
            loader.cache.sigHalt = true; 
            loader.cache.isConnected = false; 
            loader.cache.session = null;
            this.isNoaaWeatherWireService = false;
        }
    }
}

export default AlertManager;
export { StanzaParser, EventParser, TextParser, VtecParser, UGCParser, EAS, Database, types };