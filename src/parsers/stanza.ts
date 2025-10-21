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


import * as loader from '../bootstrap';
import * as types from '../types';

export class StanzaParser {

    /**
     * @function validate
     * @description
     *     Validates and parses a stanza message, extracting its attributes and metadata.
     *     Handles both raw message strings (for debug/testing) and actual stanza objects.
     *     Determines whether the message is a CAP alert, contains VTEC codes, or contains UGCs,
     *     and identifies the AWIPS product type and prefix.
     *
     * @static
     * @param {any} stanza
     * @param {boolean | types.StanzaAttributes} [isDebug=false]
     * @returns {{
     *     message: string;
     *     attributes: types.StanzaAttributes;
     *     isCap: boolean,
     *     isVtec: boolean;
     *     isCapDescription: boolean;
     *     awipsType: Record<string, string>;
     *     isApi: boolean;
     *     ignore: boolean;
     *     isUGC?: boolean;
     * }}
     */
    public static validate(stanza: any, isDebug: boolean | types.StanzaAttributes = false): { message: string; attributes: types.StanzaAttributes; isCap: any; isVtec: boolean; isCapDescription: any; awipsType: any; isApi: boolean; ignore: boolean; isUGC?: boolean; } {
        if (isDebug !== false) { 
            const vTypes = isDebug as types.StanzaAttributes;
            const message = stanza;
            const attributes = vTypes;
            const isCap = vTypes.isCap ?? message.includes(`<?xml`);
            const isCapDescription = message.includes(`<areaDesc>`);
            const isVtec = message.match(loader.definitions.expressions.vtec) != null;
            const isUGC = message.match(loader.definitions.expressions.ugc1) != null;
            const awipsType = this.getType(attributes);
            return { message, attributes, isCap, isVtec, isUGC, isCapDescription, awipsType: awipsType, isApi: false, ignore: false };
        }
        if (stanza.is(`message`)) {
            let cb = stanza.getChild(`x`)
            if (cb && cb.children) {
                let message = unescape(cb.children[0])
                let attributes = cb.attrs
                if (attributes.awipsid && attributes.awipsid.length > 1) {
                    const isCap = message.includes(`<?xml`);
                    const isCapDescription = message.includes(`<areaDesc>`);
                    const isVtec = message.match(loader.definitions.expressions.vtec) != null;
                    const isUGC = message.match(loader.definitions.expressions.ugc1) != null;
                    const awipsType = this.getType(attributes);
                    this.cache(message, {attributes, isCap, isVtec, awipsType });
                    return { message, attributes, isCap, isVtec, isUGC, isCapDescription, awipsType: awipsType, isApi: false, ignore: false  };
                }
            }
        }
        return { message: null, attributes: null, isApi: null, isCap: null, isVtec: null, isUGC: null, isCapDescription: null, awipsType: null, ignore: true };
    }

    /**
     * @function getType
     * @description
     *     Determines the AWIPS product type and prefix from a stanza's attributes.
     *     Returns a default type of 'XX' if the attributes are missing or the AWIPS ID
     *     does not match any known definitions.
     *
     * @private
     * @static
     * @param {unknown} attributes
     * @returns {Record<string, string>}
     */
    private static getType(attributes: unknown): Record<string, string> {
        const attrs = attributes as types.StanzaAttributesType | undefined;
        if (!attrs?.awipsid) return { type: 'XX', prefix: 'XX' };
        const awipsDefs = loader.definitions.awips;
        for (const [prefix, type] of Object.entries(awipsDefs)) {
            if (attrs.awipsid.startsWith(prefix)) {
                return { type, prefix };
            }
        }
        return { type: 'XX', prefix: 'XX' };
    }

    /**
     * @function cache
     * @description
     *     Saves a compiled stanza message to the local cache directory.
     *     Ensures the message contains "STANZA ATTRIBUTES..." metadata and timestamps,
     *     and appends the formatted entry to both a category-specific file and a general cache file.
     *
     * @private
     * @static
     * @async
     * @param {unknown} compiled
     * @returns {Promise<void>}
     */
    private static async cache(message: string, compiled: unknown): Promise<void> {
        if (!compiled) return;
        const data = compiled as types.StanzaCompiled;
        const settings = loader.settings as types.ClientSettingsTypes;
        const { fs, path } = loader.packages;
        if (!message || !settings.noaa_weather_wire_service_settings.cache.directory) return;
        const cacheDir = settings.noaa_weather_wire_service_settings.cache.directory;
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const prefix = `category-${data.awipsType.prefix}-${data.awipsType.type}s`;
        const suffix = `${data.isCap ? 'cap' : 'raw'}${data.isVtec ? '-vtec' : ''}`;
        const categoryFile = path.join(cacheDir, `${prefix}-${suffix}.bin`);
        const cacheFile = path.join(cacheDir, `cache-${suffix}.bin`);
        const entry = `[SoF]\nSTANZA ATTRIBUTES...${JSON.stringify(compiled)}\n[EoF]\n${message}`;
        await Promise.all([
            fs.promises.appendFile(categoryFile, entry, 'utf8'),
            fs.promises.appendFile(cacheFile, entry, 'utf8'),
        ]);
    }
    
}

export default StanzaParser;