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

let loader = require(`./bootstrap.js`);

class NoaaWeatherWireServiceCore { 
    constructor(metadata={}) {
        this.packages = loader.packages;
        this.metadata = metadata;
        loader.settings = { ...loader.settings, ...metadata };
        process.on('uncaughtException', (error) => {
            const hault = loader.definitions.haultingConditions.find(e => error.message.includes(e.error));
            if (hault) { loader.static.events.emit(`onError`, {error: `${hault ? hault.message : error.message}`, code: hault.code}); return; }
            loader.static.events.emit(`onError`, { error: error.stack || error.message || `An unknown error occurred`, code: `uncaught-exception` });
        });
        this.initializeDatabase([{ id: `C`, file: `USCounties` }, { id: `Z`, file: `ForecastZones` }, { id: `Z`, file: `FireZones` }, { id: `Z`, file: `OffShoreZones` }, { id: `Z`, file: `FireCounties` }, { id: `Z`, file: `Marine` }]);
        
        if (loader.settings.cacheSettings.readCache && loader.settings.cacheSettings.cacheDir) {
            let target = `${loader.settings.cacheSettings.cacheDir}/nwws-raw-category-defaults-raw-vtec.bin`;
            if (loader.packages.fs.existsSync(target)) {
                this.forwardCustomStanza(loader.packages.fs.readFileSync(target, 'utf8'), { awipsid: 'alert', category: 'default', raw: true, issue: undefined });
            }
        }
        
        setInterval(() => { 
            if (loader.settings.cacheSettings.cacheDir) { this.garbageCollect(loader.settings.cacheSettings.maxMegabytes || 1); }
            if (loader.settings.xmpp.reconnect) { this.isReconnectEligible(loader.settings.xmpp.reconnectInterval) }
        }, 1 * 1000);
    }

    /**
      * @function initializeDatabase
      * @description Initializes the SQLite database and creates the shapefiles table if it doesn't exist.
      * This also will read the shapefiles from the specified directory and insert them into the database.
      *
      * @param {Array} shapefiles - An array of shapefile objects containing `id` and `file` properties. 
      */

    initializeDatabase = async function(shapefiles = []) {
        let { fs, path, sqlite3, shapefile } = loader.packages;
        if (!fs.existsSync(loader.settings.database)) {
            fs.writeFileSync(loader.settings.database, '', 'utf8');
        }
        let db = new sqlite3(loader.settings.database);
        let tableExists = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='shapefiles'`).get();
        if (!tableExists) {
            db.prepare(`CREATE TABLE shapefiles (id TEXT PRIMARY KEY, location TEXT, geometry TEXT)`).run();
            console.log(`\n\n[NOTICE] DO NOT CLOSE THIS PROJECT UNTIL THE SHAPEFILES ARE DONE COMPLETING!\n` +
                `\t THIS COULD TAKE A WHILE DEPENDING ON THE SPEED OF YOUR STORAGE!!\n` +
                `\t IF YOU CLOSE YOUR PROJECT, THE SHAPEFILES WILL NOT BE CREATED AND YOU WILL NEED TO DELETE ${loader.settings.database} AND RESTART TO CREATE THEM AGAIN!\n\n`);
            for (let shapefileEntry of shapefiles) {
                let { file, id: type } = shapefileEntry;
                let filePath = path.join(__dirname, 'shapefiles', file);
                let { features } = await shapefile.read(filePath, filePath);
                console.log(`Creating ${file} shapefile...`);
                for (let feature of features) {
                    let { properties, geometry } = feature;
                    let id, location;
                    if (properties.FIPS) {
                        id = `${properties.STATE}${type}${properties.FIPS.substring(2)}`; location = `${properties.COUNTYNAME}, ${properties.STATE}`;
                    } else if (properties.STATE) {
                        id = `${properties.STATE}${type}${properties.ZONE}`; location = `${properties.NAME}, ${properties.STATE}`;
                    } else if (properties.FULLSTAID) {
                        id = `${properties.ST}${type}-NoZone`; location = `${properties.NAME}, ${properties.STATE}`;
                    } else {
                        id = properties.ID; location = properties.NAME;
                    }
                    await db.prepare(`INSERT OR REPLACE INTO shapefiles (id, location, geometry) VALUES (?, ?, ?)`).run(id, location, JSON.stringify(geometry));
                }
            }
            console.log(`Shapefiles created successfully!`);
        }
        loader.static.db = db;
        this.initializeSession();
    }

    /**
      * @function initializeClient
      * @description Authenticates the XMPP session for NOAA Weather Wire Service with the provided metadata.
      *
      * @param {Object} metadata - The metadata object containing authentication details.
      * @param {string} metadata.username - The username for the XMPP session.
      * @param {string} metadata.password - The password for the XMPP session.
      * @param {string} [metadata.display] - The display name for the XMPP session (optional).
      */

    initializeClient = function(metadata = {}) { 
        if (loader.settings.database == null) { throw new Error(`no-database-dir`); }
        loader.static.session = loader.packages.xmpp.client({ 
            service: `xmpp://nwws-oi.weather.gov`, 
            domain: `nwws-oi.weather.gov`, 
            username: metadata.username || ``,
            password: metadata.password || ``,
        })
    }

    /**
      * @function initializeSession
      * @description Creates a new XMPP session for NOAA Weather Wire Service and sets up event listeners for connection and stanza handling.
      * Also handles reconnection logic if the session is disconnected.
      */

    initializeSession = function() { 
        if (this.metadata.authentication.display == undefined) this.metadata.authentication.display = this.metadata.authentication.username || ``;
        this.initializeClient({ username: this.metadata.authentication.username, password: this.metadata.authentication.password, display: this.metadata.authentication.display });
        loader.static.session.on(`online`, async () => {
            if (loader.static.lastConnect && (new Date().getTime() - loader.static.lastConnect) < 10 * 1000) {
                setTimeout(async () => {
                    await loader.static.session.stop().catch(() => {});
                    await loader.static.session.start().catch(() => {});
                }, 2 * 1000);
                throw new Error(`rapid-reconnect`);
            }
            loader.static.lastConnect = new Date().getTime();
            loader.cache.isConnected = true;
            loader.static.session.send(loader.packages.xmpp.xml('presence', { to: `nwws@conference.nwws-oi.weather.gov/${this.metadata.authentication.display}`, xmlns: 'http://jabber.org/protocol/muc' }))
            loader.static.session.send(loader.packages.xmpp.xml('presence', { to: `nwws@conference.nwws-oi.weather.gov`, type: 'available' }))
            loader.static.events.emit(`onConnection`, this.metadata.authentication.display);
            if (loader.cache.attemptingReconnect) {
                setTimeout(() => { loader.cache.attemptingReconnect = false; }, 15 * 1000);
            }
        })
        loader.static.session.on(`offline`, () => {
            loader.static.session.stop().catch(() => {});
            loader.cache.isConnected = false;
            throw new Error(`unreachable-host`);
        })
        loader.static.session.on(`error`, async (error) => {
            throw new Error(error.message || `service-error`);
        })
        loader.static.session.on(`stanza`, (stanza) => {
            loader.cache.lastStanza = new Date().getTime();
            if (stanza.is('message')) {
                let validateStanza = loader.packages.mStanza.newStanza(stanza)
                if (validateStanza.ignore 
                    || (validateStanza.isCap && !loader.settings.alertSettings.onlyCap) 
                    || (!validateStanza.isCap && loader.settings.alertSettings.onlyCap) 
                    || (validateStanza.isCap && !validateStanza.hasCapArea)) return;
                loader.packages.mStanza.createNewAlert(validateStanza);
                loader.static.events.emit(`onMessage`, validateStanza);
            }
            if (stanza.is('presence') && stanza.attrs.from && stanza.attrs.from.startsWith('nwws@conference.nwws-oi.weather.gov/')) {
                let occupant = stanza.attrs.from.split('/').slice(1).join('/');
                loader.static.events.emit('onOccupant', { occupant, type: stanza.attrs.type === 'unavailable' ? 'unavailable' : 'available' });
            }
        })
        loader.static.session.start();
    }

    /**
      * @function isReconnectEligible
      * @description Checks if the session is eligible for reconnection based on the last stanza time
      * and attempts to reconnect if necessary.
      * 
      * @param {number} [minSeconds=60] - The minimum number of seconds since the last stanza to consider reconnection.
      */

    isReconnectEligible = async function(minSeconds=60) {
        if (loader.cache.isConnected && loader.static.session) {
            let lastStanza = new Date().getTime() - loader.cache.lastStanza;
            if (lastStanza > minSeconds * 1000) {
                if (!loader.cache.attemptingReconnect) {
                    loader.cache.attemptingReconnect = true;
                    loader.cache.isConnected = false;
                    loader.cache.totalReconnects += 1;
                    loader.static.events.emit(`onReconnect`, { reconnects: loader.cache.totalReconnects, lastStanza: lastStanza / 1000, lastName: this.metadata.authentication.display});
                    await loader.static.session.stop().catch(() => {});
                    await loader.static.session.start().catch(() => {});
                } 
            }
        }
        return { message: `Session is not connected or session is not available`, isConnected: loader.cache.isConnected, session: loader.static.session };
    }

    /**
      * @function setDisplayName
      * @description Sets the display name for the XMPP session.
      * 
      * @param {string} displayName - The display name to set for the XMPP session.
      */

    setDisplayName = async function(displayName) {
        this.metadata.authentication.display = displayName;
    }

    /**
      * @function forwardCustomStanza
      * @description Forwards a custom stanza message to the appropriate event handler.
      * 
      * @param {string} message - The custom message to forward.
      * @param {object} attributes - The attributes of the custom message.
      */

    forwardCustomStanza = function(stanza, attrs) {
        let validateStanza = loader.packages.mStanza.newStanza(stanza, { stanza, attrs });
        loader.packages.mStanza.createNewAlert(validateStanza);
    }

    /**
      * @function garbageCollect
      * @description Deletes files in the database directory that exceed a specified size limit.
      *
      * @param {number} [maxMegabytes=1] - The maximum size in megabytes for files to keep. Files larger than this will be deleted.
      */

    garbageCollect = function(maxMegabytes=1) {
        if (!loader.settings.cacheSettings.cacheDir) return;
        let maxBytes = maxMegabytes * 1024 * 1024, directory = loader.settings.cacheSettings.cacheDir
        let stackFiles = [directory], files = []
        while (stackFiles.length) {
            let currentDirectory = stackFiles.pop();
            loader.packages.fs.readdirSync(currentDirectory).forEach(file => {
                let filePath = loader.packages.path.join(currentDirectory, file);
                loader.packages.fs.statSync(filePath).isDirectory() ? stackFiles.push(filePath) : files.push({ file: filePath, size: loader.packages.fs.statSync(filePath).size });
            });
        }
        if (!files.length) return;
        files.forEach(({ file, size }) => { if (size > maxBytes) { loader.packages.fs.unlinkSync(file); } });
        return;
    }

    /**
      * @function onEvent
      * @description Registers an event listener for the specified event.
      * @param {string} event - The name of the event to listen for.
      * @param {function} listener - The callback function to execute when the event is emitted.
      */

    onEvent = function(event, listener) {
        loader.static.events.on(event, listener)
        return () => { loader.static.events.off(event, listener); };
    }
}

module.exports = NoaaWeatherWireServiceCore;