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
     * handleAlertCache stores a unique alert in the SQLite database and ensures the total number of alerts does not exceed 5000.
     *
     * @public
     * @static
     * @async
     * @param {*} alert 
     * @returns {*} 
     */
    public static async stanzaCacheImport(stanza: string): Promise<void> {
        const settings = loader.settings as types.ClientSettings;
        try {
            const db = loader.cache.db;
            if (!db) return;
            db.prepare(`INSERT OR IGNORE INTO stanzas (stanza) VALUES (?)`).run(stanza);
            const countRow = db.prepare(`SELECT COUNT(*) AS total FROM stanzas`).get() as { total: number };
            const totalRows = countRow.total;
            const maxHistory = settings.NoaaWeatherWireService.cache.maxHistory;
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
     * loadDatabase initializes the SQLite database and imports shapefile data if the database or table does not exist.
     *
     * @public
     * @static
     * @async
     * @returns {Promise<void>} 
     */
    public static async loadDatabase(): Promise<void> {
        const settings = loader.settings as types.ClientSettings;
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