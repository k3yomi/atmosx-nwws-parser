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


export class Database {

    /**
     * @function stanzaCacheImport
     * @description
     *     Inserts a single NWWS stanza into the database cache. If the total number
     *     of stanzas exceeds the configured maximum history, it deletes the oldest
     *     entries to maintain the limit. Duplicate stanzas are ignored.
     *
     * @static
     * @async
     * @param {string} stanza
     *     The raw stanza XML or text to store in the database.
     * 
     * @returns {Promise<void>}
     *     Resolves when the stanza has been inserted and any necessary pruning
     *     of old stanzas has been performed.
     *
     * @example
     *     await Database.stanzaCacheImport("<alert>...</alert>");
     */
    public static async stanzaCacheImport(stanza: string): Promise<void> {
        const settings = loader.settings as types.ClientSettingsTypes;
        try {
            const db = loader.cache.db;
            if (!db) return;
            db.prepare(`INSERT OR IGNORE INTO stanzas (stanza) VALUES (?)`).run(stanza);
            const countRow = db.prepare(`SELECT COUNT(*) AS total FROM stanzas`).get() as { total: number };
            const totalRows = countRow.total;
            const maxHistory = settings.noaa_weather_wire_service_settings.cache.max_db_history;
            if (totalRows > maxHistory) {
                const rowsToDelete = Math.floor((totalRows - maxHistory) / 2);
                if (rowsToDelete > 0) {
                    db.prepare(`
                        DELETE FROM stanzas 
                        WHERE rowid IN (
                            SELECT rowid 
                            FROM stanzas 
                            ORDER BY rowid ASC 
                            LIMIT ?
                        )
                    `).run(rowsToDelete);
                }
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            Utils.warn(`Failed to import stanza into cache: ${msg}`);
        }
    }

    /**
     * @function loadDatabase
     * @description
     *     Initializes the application's SQLite database, creating necessary tables
     *     for storing stanzas and shapefiles. If the shapefiles table is empty,
     *     it imports predefined shapefiles from disk, processes their features,
     *     and populates the database. Emits warnings during the import process.
     *
     * @static
     * @async
     * @returns {Promise<void>}
     *     Resolves when the database and shapefiles have been initialized.
     *
     * @example
     *     await Database.loadDatabase();
     *     console.log('Database initialized and shapefiles imported.');
     */
    public static async loadDatabase(): Promise<void> {
        const settings = loader.settings as types.ClientSettingsTypes;
        try {
            const { fs, path, sqlite3, shapefile } = loader.packages;
            if (!fs.existsSync(settings.database)) fs.writeFileSync(settings.database, '');
            loader.cache.db = new sqlite3(settings.database);
            loader.cache.db.prepare(`
                CREATE TABLE IF NOT EXISTS stanzas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    stanza TEXT
                )
            `).run();
            loader.cache.db.prepare(`
                CREATE TABLE IF NOT EXISTS shapefiles (
                    id TEXT PRIMARY KEY,
                    location TEXT,
                    geometry TEXT
                )
            `).run();
            const shapefileCount = loader.cache.db.prepare(`SELECT COUNT(*) AS count FROM shapefiles`).get().count;
            if (shapefileCount === 0) {
                await Utils.sleep(1000);
                Utils.warn(loader.definitions.messages.shapefile_creation);
                for (const shape of loader.definitions.shapefiles) {
                    const filepath = path.resolve(__dirname, '../../shapefiles', shape.file);
                    const { features } = await shapefile.read(filepath, filepath);
                    Utils.warn(`Importing ${features.length} entries from ${shape.file}...`);
                    const insertStmt = loader.cache.db.prepare(`
                        INSERT OR REPLACE INTO shapefiles (id, location, geometry) VALUES (?, ?, ?)
                    `);
                    const insertTransaction = loader.cache.db.transaction((entries: any[]) => {
                        for (const feature of entries) {
                            const { properties, geometry } = feature;
                            let final: string, location: string;
                            if (properties.FIPS) {
                                final = `${properties.STATE}${shape.id}${properties.FIPS.substring(2)}`;
                                location = `${properties.COUNTYNAME}, ${properties.STATE}`;
                            } else if (properties.FULLSTAID) {
                                final = `${properties.ST}${shape.id}${properties.WFO}`;
                                location = `${properties.CITY}, ${properties.STATE}`;
                            } else if (properties.STATE) {
                                final = `${properties.STATE}${shape.id}${properties.ZONE}`;
                                location = `${properties.NAME}, ${properties.STATE}`;
                            } else {
                                final = properties.ID;
                                location = properties.NAME;
                            }
                            insertStmt.run(final, location, JSON.stringify(geometry));
                        }
                    });
                    insertTransaction(features);
                }
                Utils.warn(loader.definitions.messages.shapefile_creation_finished);
            }
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : String(error);
            Utils.warn(`Failed to load database: ${msg}`);
        }
    }

}

export default Database;