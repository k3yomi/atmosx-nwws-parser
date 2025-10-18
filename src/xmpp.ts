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
     * isSessionReconnectionEligible checks if the XMPP session is eligible for reconnection based on the last 
     * received stanza time and current interval.
     *
     * @public
     * @static
     * @async
     * @param {number} currentInterval 
     * @returns {Promise<void>} 
     */
    public static async isSessionReconnectionEligible(currentInterval: number) {
        const settings = loader.settings as types.ClientSettings;
        if ((loader.cache.isConnected || loader.cache.sigHalt ) && loader.cache.session) { 
            const lastStanza = Date.now() - loader.cache.lastStanza;
            if (lastStanza >= (currentInterval * 1000)) {
                if (!loader.cache.attemptingReconnect) { 
                    loader.cache.attemptingReconnect = true;
                    loader.cache.isConnected = false;
                    loader.cache.totalReconnects += 1;
                    loader.cache.events.emit(`onReconnection`, { reconnects: loader.cache.totalReconnects, lastStanza: lastStanza, lastName: settings.NoaaWeatherWireService.clientCredentials.nickname})
                    await loader.cache.session.stop().catch(() => {});
                    await loader.cache.session.start().catch(() => {});
                }
            }
        }
    }  

    /**
     * deploySession initializes and starts the XMPP client session, setting up event listeners for 
     * connection management and message handling. This function is specifically tailored for
     * NoaaWeatherWireService and connects to their XMPP server.
     *
     * @public
     * @static
     * @async
     * @returns {Promise<void>} 
     */
    public static async deploySession() { 
        const settings = loader.settings as types.ClientSettings
        loader.cache.session = loader.packages.xmpp.client({
            service: `xmpp://nwws-oi.weather.gov`, 
            domain: `nwws-oi.weather.gov`,
            username: settings.NoaaWeatherWireService.clientCredentials.username,
            password: settings.NoaaWeatherWireService.clientCredentials.password,
        });
        settings.NoaaWeatherWireService.clientCredentials.nickname ??= settings.NoaaWeatherWireService.clientCredentials.username;
        loader.cache.session.on(`online`, async (address: string) => {
            if (loader.cache.lastConnect && Date.now() - loader.cache.lastConnect < 10 * 1000) {
                loader.cache.sigHalt = true;
                Utils.sleep(2 * 1000).then(async () => { await loader.cache.session.stop() });
                Utils.warn(loader.definitions.messages.reconnect_too_fast);
                return;
            }
            loader.cache.isConnected = true;
            loader.cache.sigHalt = false;
            loader.cache.lastConnect = Date.now();
            loader.cache.session.send(loader.packages.xmpp.xml('presence', { to: `nwws@conference.nwws-oi.weather.gov/${settings.NoaaWeatherWireService.clientCredentials.nickname}`, xmlns: 'http://jabber.org/protocol/muc' }))
            loader.cache.events.emit(`onConnection`, settings.NoaaWeatherWireService.clientCredentials.nickname)
            if (loader.cache.attemptingReconnect) { 
                Utils.sleep(15 * 1000).then(() => { loader.cache.attemptingReconnect = false; })
            }
        });
        loader.cache.session.on(`offline`, async () => {
            loader.cache.isConnected = false;
            loader.cache.sigHalt = true;
            Utils.warn(`XMPP connection went offline`);
        });
        loader.cache.session.on(`error`, async (error: Error) => {
            loader.cache.isConnected = false;
            loader.cache.sigHalt = true;
            Utils.warn(`XMPP connection error: ${error.message}`);
        });
        loader.cache.session.on(`stanza`, async (stanza: any) => {
            try {
                loader.cache.lastStanza = Date.now()
                if (stanza.is(`message`)) {
                    const validate = StanzaParser.validate(stanza);
                    if ( validate.ignore || (validate.isCap && !settings.NoaaWeatherWireService.alertPreferences.isCapOnly) || (!validate.isCap && settings.NoaaWeatherWireService.alertPreferences.isCapOnly) || (validate.isCap && !validate.isCapDescription) ) return;
                    EventParser.eventHandler(validate);
                    loader.cache.events.emit(`onMessage`, validate)
                    Database.stanzaCacheImport(JSON.stringify(validate))
                }
                if (stanza.is(`presence`) && stanza.attrs.from && stanza.attrs.from.startsWith('nwws@conference.nwws-oi.weather.gov/')) {
                    const occupant = stanza.attrs.from.split('/').slice(1).join('/');
                    loader.cache.events.emit('onOccupant', { occupant, type: stanza.attrs.type === 'unavailable' ? 'unavailable' : 'available' });
                }
            } catch (e) {
                Utils.warn(`Error processing stanza: ${(e as Error).message}`);
            }
        });
        await loader.cache.session.start().catch(() => {})
    }

}

export default Xmpp;