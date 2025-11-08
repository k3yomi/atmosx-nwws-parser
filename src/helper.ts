/*
                                            _               _     __   __
         /\  | |                           | |             (_)    \ \ / /
        /  \ | |_ _ __ ___   ___  ___ _ __ | |__   ___ _ __ _  ___ \ V / 
       / /\ \| __| '_ ` _ \ / _ \/ __| '_ \| '_ \ / _ \ '__| |/ __| > <  
      / ____ \ |_| | | | | | (_) \__ \ |_) | | | |  __/ |  | | (__ / . \ 
     /_/    \_\__|_| |_| |_|\___/|___/ .__/|_| |_|\___|_|  |_|\___/_/ \_\
                                     | |                                 
                                     |_|                                                                                                                
    
    Written by: k3yomi@GitHub                        
*/

import * as loader from '../bootstrap';
import mStanza from './stanza';

export class AtmosXWireParser {
    packages: any;
    metadata: any;
    constructor(metadata: any) {
        this.packages = loader.packages;
        this.metadata = metadata;
        Object.assign(loader.settings, metadata);
        this.errorHandler();
        this.initalizeDatabase(this.metadata.database);
        this.initalizeCache();
        setInterval(() => {
            if (loader.settings.cacheSettings.cacheDir) { this.garabeCollector(loader.settings.cacheSettings.maxMegabytes) }
            if (loader.settings.xmpp.reconnect) { this.isReconnectEligible(loader.settings.xmpp.reconnectInterval) }
        }, 1 * 1000);
    }

    /**
      * @function initalizeDatabase
      * @description Initalizes the database and creates the shapefiles table if it does not exist. 
      * Also imports shapefiles into the database if the table is created.
      * 
      * @param {string} database - The path to the database file.
      */

    initalizeDatabase = async(database: any) => {
        const { fs, sqlite3, path, shapefile } = this.packages;
        if (!fs.existsSync(database)) { // If the database file DOES NOT exist, create it with empty content
            fs.writeFileSync(database, '', 'utf8');
        }
        const db = new sqlite3(database);
        loader.statics.db = db;
        let parseShapefiles = async() => {
            const shapefiles = [{ id: `C`, file: `USCounties` }, { id: `Z`, file: `ForecastZones` }, { id: `Z`, file: `FireZones` }, { id: `Z`, file: `OffShoreZones` }, { id: `Z`, file: `FireCounties` }, { id: `Z`, file: `Marine` }]
            for (let shape of shapefiles) {
                const { id, file } = shape;
                const filepath = path.resolve(__dirname, '../../shapefiles', `${file}`);
                const { features } = await shapefile.read(filepath, filepath);
                console.log(`Importing ${features.length} features from ${file}...`);
                for (let feature of features) {
                    let { properties, geometry } = feature;
                    let equals, location;
                    if ( properties.FIPS ) { 
                        equals = `${properties.STATE}${id}${properties.FIPS.substring(2)}`; location = `${properties.COUNTYNAME}, ${properties.STATE}`;
                    } else if ( properties.FULLSTAID ) {
                        equals = `${properties.ST}${id}${properties.WFO}`; location = `${properties.CITY}, ${properties.STATE}`;
                    } else if ( properties.STATE ) {
                        equals = `${properties.STATE}${id}${properties.ZONE}`; location = `${properties.NAME}, ${properties.STATE}`;
                    } else { 
                        equals = properties.ID; location = properties.NAME;
                    }
                    const importStatement = `INSERT OR REPLACE INTO shapefiles (id, location, geometry) VALUES (?, ?, ?)`;
                    await db.prepare(importStatement).run(equals, location, JSON.stringify(geometry));
                }
                console.log(`Finished importing ${file}.`);
            }
        }
        let isExisting = async() => {
            const checkStatement = `SELECT name FROM sqlite_master WHERE type='table' AND name='shapefiles'`;
            if (!db.prepare(checkStatement).get()) {
                db.prepare(`CREATE TABLE shapefiles (id TEXT PRIMARY KEY, location TEXT, geometry TEXT)`).run();
                console.log(loader.definitions.messages.shapefile_creation);
                await parseShapefiles();
                console.log(loader.definitions.messages.shapefile_creation_finished);
            }
        }
        await isExisting();
        this.initalizeSession(this.metadata);
    }

    /**
      * @function initalizeClient
      * @description Initalizes the XMPP client and sets up event listeners.
      * 
      * @param {object} metadata - The metadata object containing authentication information.
      */

    initalizeClient = (metadata: any) => {
        if (loader.settings.database == null) { throw new Error(`error-database-not-configured`); }
        loader.statics.session = loader.packages.xmpp.client({ 
            service: `xmpp://nwws-oi.weather.gov`, 
            domain: `nwws-oi.weather.gov`,
            username: metadata.authentication.username || null,
            password: metadata.authentication.password || null,
        });
    }

    /**
      * @function initalizeSession
      * @description Initalizes the XMPP session and sets up event listeners for connection, disconnection, errors, and incoming stanzas.
      * 
      * @param {object} metadata - The metadata object containing authentication information.
      * 
      * @emits onConnection - Emitted when the client successfully connects to the XMPP server.
      * @emits onStanza - Emitted when a valid stanza is received from the XMPP server.
      * @emits onError - Emitted when an error occurs.
      * @emits onReconnect - Emitted when the client attempts to reconnect to the XMPP server.
      * @throws Will throw an error if the database is not configured, if the client is reconnecting too fast, or if the connection to the XMPP server is lost.
      */

    initalizeSession = async (metadata: any) => {
        if (this.metadata.authentication.display == undefined) this.metadata.authentication.display = this.metadata.authentication.username || `No Username Provided`;
        this.initalizeClient(this.metadata);
        loader.statics.session.on(`online`, async(address: any) => {
            if (loader.cache.lastConnect && (new Date().getTime() - loader.cache.lastConnect) < 10 * 1000) {
                setTimeout(async () => {
                    await loader.statics.session.stop().catch(() => { });
                    await loader.statics.session.start().catch(() => { });
                }, 2 * 1000);
                loader.cache.sigHault = true;
                throw new Error(`error-reconnecting-too-fast`); // Patch v1.0.14 - Prevents reconnecting too fast
            }
            loader.statics.session.send(loader.packages.xmpp.xml('presence', { to: `nwws@conference.nwws-oi.weather.gov/${this.metadata.authentication.display}`, xmlns: 'http://jabber.org/protocol/muc' }))
            loader.statics.session.send(loader.packages.xmpp.xml('presence', { to: `nwws@conference.nwws-oi.weather.gov`, type: 'available' }))
            loader.statics.events.emit(`onConnection`, this.metadata.authentication.display);

            loader.cache.lastConnect = new Date().getTime();
            loader.cache.sigHault = false;
            loader.cache.isConnected = true;

            if (loader.cache.attemptingReconnect) { 
                setTimeout(() => { loader.cache.attemptingReconnect = false; }, 15 * 1000);
            }
        });
        loader.statics.session.on(`offline`, () => {
            loader.cache.isConnected = false;
            loader.cache.sigHault = true;
            loader.cache.attemptingReconnect = false;
            throw new Error(`error-connection-lost`);
        });
        loader.statics.session.on(`error`, (err: any) => {
            loader.cache.isConnected = false;
            loader.cache.sigHault = true;
            loader.cache.attemptingReconnect = false;
            throw new Error(err.message || `error-connection-lost`);
        })
        loader.statics.session.on(`stanza`, (stanza: any) => {
            loader.cache.lastStanza = new Date().getTime();
            try {
                if (stanza.is(`message`)) { 
                    const sValid = mStanza.validate(stanza);
                    if ( sValid.ignore || (sValid.isCap && !loader.settings.alertSettings.onlyCap) || (!sValid.isCap && loader.settings.alertSettings.onlyCap) || (sValid.isCap && !sValid.hasCapDescription) ) return;
                    loader.statics.events.emit(`onMessage`, sValid);
                    mStanza.create(sValid);
                }
                if (stanza.is('presence') && stanza.attrs.from && stanza.attrs.from.startsWith('nwws@conference.nwws-oi.weather.gov/')) {
                    let occupant = stanza.attrs.from.split('/').slice(1).join('/');
                    loader.statics.events.emit('onOccupant', { occupant, type: stanza.attrs.type === 'unavailable' ? 'unavailable' : 'available' });
                }
            } catch (error) {
                loader.statics.events.emit(`onError`, { error: (error as any).message || `An unknown error occurred`, code: `stanza-parse-error` });
                return;
            }
        })
        await loader.statics.session.start();
    }

    /**
      * @function initalizeCache
      * @description Initalizes the cache by reading cached stanzas from files in the cache directory.
      * The function checks the alert settings to determine which files to read and processes each file by validating and creating stanzas.
      * If the cache directory is not set or reading from cache is disabled, the function returns without performing any actions.
      */

    initalizeCache = () => {
        if (loader.settings.cacheSettings.readCache && loader.settings.cacheSettings.cacheDir) {
            let dir = loader.settings.cacheSettings.cacheDir;
            let dict = [
                { file: `${dir}/category-defaults-raw-vtec.bin`, attributes: { awipsid: 'alert', isCap: false, raw: true, issue: undefined }},
                { file: `${dir}/category-defaults-cap-vtec.bin`, attributes: { awipsid: 'alert', isCap: true, raw: false, issue: undefined }},
                { file: `${dir}/category-defaults-raw.bin`, attributes: { awipsid: 'alert', isCap: false, raw: true, issue: undefined }},
                { file: `${dir}/category-special-weather-statements-raw.bin`, attributes: { awipsid: 'SPS001', isCap: false, raw: true, issue: undefined }},
                { file: `${dir}/category-mesoscale-discussions-raw.bin`, attributes:  { awipsid: 'SWOMCD001', isCap: false, raw: true, issue: undefined }},
                { file: `${dir}/category-local-storm-reports.bin`, attributes: { awipsid: 'LSR001', isCap: false, raw: true, issue: undefined }},
            ]
            for (let file of dict) {
                if (file.attributes.isCap && !loader.settings.alertSettings.onlyCap) continue;
                if (!file.attributes.isCap && loader.settings.alertSettings.onlyCap) continue;
                if (!this.packages.fs.existsSync(file.file)) continue;
                let read = this.packages.fs.readFileSync(file.file, 'utf8');
                const sValid = mStanza.validate(read, file.attributes);
                mStanza.create(sValid);
            }
        }
    }

    /**
      * @function errorHandler
      * @description Sets up a global error handler to catch uncaught exceptions and emit an 'onError' event with the error details.
      * The function checks if the error message matches any predefined halting conditions and includes the corresponding message and code in the emitted event.
      * This helps in logging and handling errors gracefully within the application.
      */

    errorHandler = () => {
        process.on('uncaughtException', (error) => {
            const hault = loader.definitions.haultingConditions.find(e => error.message.includes(e.error));
            if (hault) { loader.statics.events.emit(`onError`, {error: `${hault ? hault.message : error.message}`, code: (hault as any).code }); }
            loader.statics.events.emit(`onError`, { error: error.stack || error.message || `An unknown error occurred`, code: `uncaught-exception` });
        });
    }

    /** 
      * @function garabeCollector
      * @description Cleans up cache files in the specified cache directory that exceed the maximum allowed size.
      * The function traverses the cache directory and its subdirectories, checking the size of each file.
      * If a file exceeds the specified maximum size in megabytes, it is deleted.
      * 
      * @param {number} maxMegabytes - The maximum allowed size for cache files in megabytes.
      */

    garabeCollector = (maxMegabytes: number) => {
        if (!loader.settings.cacheSettings.cacheDir) return;
        let maxBytes = maxMegabytes * 1024 * 1024
        let directory = loader.settings.cacheSettings.cacheDir
        let stackFiles: string[] = [directory], files: { file: string, size: number }[] = [];
        while (stackFiles.length) {
            const currentDirectory = stackFiles.pop();
            if (!currentDirectory || typeof currentDirectory !== "string") continue;
            loader.packages.fs.readdirSync(currentDirectory).forEach((file: string) => {
                const filePath = loader.packages.path.join(currentDirectory, file);
                if (loader.packages.fs.statSync(filePath).isDirectory()) {
                    stackFiles.push(filePath);
                } else {
                    files.push({ file: filePath, size: loader.packages.fs.statSync(filePath).size });
                }
            });
        }
        if (!files.length) return;
        files.forEach(({ file, size }) => { if (size > maxBytes) { loader.packages.fs.unlinkSync(file); } });
        return;
    }

    /** 
      * @function isReconnectEligible
      * @description Checks if the client is eligible to reconnect based on the specified interval. 
      * If the client is not connected and the last stanza received was longer than the specified interval ago,
      * the function attempts to reconnect the client.
      * 
      * @param {number} interval - The minimum interval in seconds between reconnection attempts.
      * @returns {object} An object containing the connection status and session information.
      */

    isReconnectEligible = async (interval: number) => {
        const minSeconds = interval;
        if ((loader.cache.isConnected || loader.cache.sigHault === true) && loader.statics.session) {
            let lastStanza = new Date().getTime() - loader.cache.lastStanza;
            if (lastStanza > minSeconds * 1000) {
                if (!loader.cache.attemptingReconnect) {
                    loader.cache.attemptingReconnect = true;
                    loader.cache.isConnected = false;
                    loader.cache.totalReconnects += 1;
                    loader.statics.events.emit(`onReconnect`, { reconnects: loader.cache.totalReconnects, lastStanza: lastStanza / 1000, lastName: this.metadata.authentication.display });
                    await loader.statics.session.stop().catch(() => {});
                    await loader.statics.session.start().catch(() => {});
                }
            }
        }
        return {
            message: `Session is not connected or session is not available`,
            isConnected: loader.cache.isConnected,
            session: loader.statics.session
        };
    }

    /** 
      * @function setDisplayName
      * @description Sets the display name for the XMPP session.
      * 
      * @param {string} name - The display name to set for the session.
      */

    setDisplayName = async(name: string) => {
        this.metadata.authentication.display = name
    }

    /** 
      * @function onEvent
      * @description Registers an event listener for the specified event and returns a function to remove the listener.
      * 
      * @param {string} event - The name of the event to listen for.
      * @param {function} callback - The callback function to execute when the event is emitted.
      * @returns {function} A function that removes the event listener when called.
      */
        
    onEvent = (event: string, callback: any) => {
        loader.statics.events.on(event, callback);
        return () => { loader.statics.events.off(event, callback); }
    }
}



export default AtmosXWireParser;