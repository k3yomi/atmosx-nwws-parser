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


export class Database {

    /**
     * handleAlertCache stores a unique alert in the SQLite database and ensures the total number of alerts does not exceed 5000.
     *
     * @public
     * @static
     * @async
     * @param {*} alert 
     * @returns {*} 
     */
    public static async stanzaCacheImport(stanza: string) {
        const settings = loader.settings as types.ClientSettings;
        loader.cache.db.prepare(`INSERT OR IGNORE INTO stanzas (stanza) VALUES (?)`).run(stanza);
        const count = loader.cache.db.prepare(`SELECT COUNT(*) as total FROM stanzas`).get() as { total: number };
        if (count.total > settings.NoaaWeatherWireService.cache.maxHistory) {
            loader.cache.db.prepare(`DELETE FROM stanzas WHERE rowid IN (SELECT rowid FROM stanzas ORDER BY rowid ASC LIMIT ?)`).run(count.total - settings.NoaaWeatherWireService.cache.maxHistory / 2); 
        }
    }

    /**
     * loadDatabase initializes the SQLite database and imports shapefile data if the database or table does not exist.
     *
     * @public
     * @static
     * @async
     * @returns {Promise<void>} 
     */
    public static async loadDatabase() {
        const settings = loader.settings as types.ClientSettings;
        try {
            if (!loader.packages.fs.existsSync(settings.database)) { loader.packages.fs.writeFileSync(settings.database, ''); }
            loader.cache.db = new loader.packages.sqlite3(settings.database);
            const shapfileTable = loader.cache.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='shapefiles'`).get();
            const stanzaTable = loader.cache.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='stanzas'`).get();
            if (!stanzaTable) { loader.cache.db.prepare(`CREATE TABLE stanzas (id INTEGER PRIMARY KEY AUTOINCREMENT, stanza TEXT)`).run(); }
            if (!shapfileTable) {
                loader.cache.db.prepare(`CREATE TABLE shapefiles (id TEXT PRIMARY KEY, location TEXT, geometry TEXT)`).run();
                console.log(loader.definitions.messages.shapefile_creation);
                for (const shape of loader.definitions.shapefiles) {
                    const { id, file } = shape;
                    const filepath = loader.packages.path.join(__dirname, `../../shapefiles`, file);
                    const { features } = await loader.packages.shapefile.read(filepath, filepath);
                    console.log(`Importing ${features.length} entries from ${file}...`);
                    const insertStmt = loader.cache.db.prepare(`INSERT OR REPLACE INTO shapefiles (id, location, geometry)VALUES (?, ?, ?)`);
                    const insertTransaction = loader.cache.db.transaction((entries: any[]) => {
                        for (const feature of entries) {
                            const { properties, geometry } = feature;
                            let final: string, location: string;
                            switch (true) {
                                case !!properties.FIPS:
                                    final = `${properties.STATE}${id}${properties.FIPS.substring(2)}`;
                                    location = `${properties.COUNTYNAME}, ${properties.STATE}`;
                                    break;
                                case !!properties.FULLSTAID:
                                    final = `${properties.ST}${id}${properties.WFO}`;
                                    location = `${properties.CITY}, ${properties.STATE}`;
                                    break;
                                case !!properties.STATE:
                                    final = `${properties.STATE}${id}${properties.ZONE}`;
                                    location = `${properties.NAME}, ${properties.STATE}`;
                                    break;
                                default:
                                    final = properties.ID;
                                    location = properties.NAME;
                                    break;
                            }
                            insertStmt.run(final, location, JSON.stringify(geometry));
                        }
                    });
                    await insertTransaction(features);
                }
                console.log(loader.definitions.messages.shapefile_creation_finished);
            }
        } catch (error: any) {
            loader.cache.events.emit('onError', { code: 'error-load-database', message: `Failed to load database: ${error.message}`});
        }
    }
}

export default Database;