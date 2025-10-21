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
import StanzaParser from './parsers/stanza';
import Database from './database';
import EventParser from './parsers/events';


export class Xmpp { 

    /** 
     * @function isSessionReconnectionEligible
     * @description
     *     Checks if the XMPP session has been inactive longer than the given interval
     *     and, if so, attempts a controlled reconnection.
     *
     * @async
     * @static
     * @param {number} currentInterval
     * @returns {Promise<void>}
     */
    public static async isSessionReconnectionEligible(currentInterval: number): Promise<void> {
        const settings = loader.settings as types.ClientSettingsTypes;
        const lastStanzaElapsed = Date.now() - loader.cache.lastStanza;
        const threshold = currentInterval * 1000;
        if ((!loader.cache.isConnected && !loader.cache.sigHalt) || !loader.cache.session) { return; }
        if (lastStanzaElapsed < threshold) { return; }
        if (loader.cache.attemptingReconnect) { return;  }
        loader.cache.attemptingReconnect = true;
        loader.cache.isConnected = false;
        loader.cache.totalReconnects += 1;
        try {
            loader.cache.events.emit("onReconnection", {
                reconnects: loader.cache.totalReconnects,
                lastStanza: lastStanzaElapsed,
                lastName: settings.noaa_weather_wire_service_settings.credentials.nickname,
            });
            await loader.cache.session.stop().catch(() => {});
            await loader.cache.session.start().catch(() => {});
        } catch (err) {
            Utils.warn(`XMPP reconnection failed: ${(err as Error).message}`);
        } finally {
            loader.cache.attemptingReconnect = false;
        }
    } 

    /**
     * @function deploySession
     * @description
     *     Initializes the NOAA Weather Wire Service (NWWS-OI) XMPP client session and
     *     manages its lifecycle events including connection, disconnection, errors,
     *     and message handling.
     *
     * @async
     * @static
     * @returns {Promise<void>}
     */
    public static async deploySession(): Promise<void> {
        const settings = loader.settings as types.ClientSettingsTypes;
        settings.noaa_weather_wire_service_settings.credentials.nickname ??= settings.noaa_weather_wire_service_settings.credentials.username;
        loader.cache.session = loader.packages.xmpp.client({
            service: 'xmpp://nwws-oi.weather.gov',
            domain: 'nwws-oi.weather.gov',
            username: settings.noaa_weather_wire_service_settings.credentials.username,
            password: settings.noaa_weather_wire_service_settings.credentials.password,
        });
        loader.cache.session.on('online', async (address: string) => {
            const now = Date.now();
            if (loader.cache.lastConnect && now - loader.cache.lastConnect < 10_000) {
                loader.cache.sigHalt = true;
                Utils.warn(loader.definitions.messages.reconnect_too_fast);
                await Utils.sleep(2_000);
                await loader.cache.session.stop().catch(() => {});
                return;
            }
            loader.cache.isConnected = true;
            loader.cache.sigHalt = false;
            loader.cache.lastConnect = now;
            loader.cache.session.send(loader.packages.xmpp.xml('presence', {
                to: `nwws@conference.nwws-oi.weather.gov/${settings.noaa_weather_wire_service_settings.credentials.nickname}`,
                xmlns: 'http://jabber.org/protocol/muc',
            }));
            loader.cache.events.emit('onConnection', settings.noaa_weather_wire_service_settings.credentials.nickname);
            if (loader.cache.attemptingReconnect) return;
            loader.cache.attemptingReconnect = true;
            await Utils.sleep(15_000);
            loader.cache.attemptingReconnect = false;
        });
        loader.cache.session.on('offline', () => {
            loader.cache.isConnected = false;
            loader.cache.sigHalt = true;
            Utils.warn('XMPP connection went offline');
        });
        loader.cache.session.on('error', (error: Error) => {
            loader.cache.isConnected = false;
            loader.cache.sigHalt = true;
            Utils.warn(`XMPP connection error: ${error.message}`);
        });
        loader.cache.session.on('stanza', async (stanza: any) => {
            try {
                loader.cache.lastStanza = Date.now();
                if (stanza.is('message')) {
                    const validate = StanzaParser.validate(stanza);
                    const skipMessage = validate.ignore ||
                            (validate.isCap && !settings.noaa_weather_wire_service_settings.preferences.cap_only) ||
                            (!validate.isCap && settings.noaa_weather_wire_service_settings.preferences.cap_only) ||
                            (validate.isCap && !validate.isCapDescription);
                    if (skipMessage) return;
                    EventParser.eventHandler(validate);
                    Database.stanzaCacheImport(JSON.stringify(validate));
                    loader.cache.events.emit('onMessage', validate);
                }
                if (stanza.is('presence') && stanza.attrs.from?.startsWith('nwws@conference.nwws-oi.weather.gov/')) {
                    const occupant = stanza.attrs.from.split('/').slice(1).join('/');
                    loader.cache.events.emit('onOccupant', {
                        occupant,
                        type: stanza.attrs.type === 'unavailable' ? 'unavailable' : 'available',
                    });
                }
            } catch (err: unknown) {
                Utils.warn(`Error processing stanza: ${(err as Error).message}`);
            }
        });
        try { await loader.cache.session.start(); } catch (err: unknown) {
            Utils.warn(`Failed to start XMPP session: ${(err as Error).message}`);
        }
    }
}

export default Xmpp;