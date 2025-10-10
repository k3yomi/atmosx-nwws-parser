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
     * validate handles the validation of incoming XMPP stanzas to ensure they contain valid alert data.
     * You can also feed debug / cache data directly into this function by specifying the second parameter
     * which is the attributes object that would normally be parsed from the XMPP stanza.
     *
     * @public
     * @static
     * @param {*} stanza 
     * @param {(boolean | types.TypeAttributes)} [isDebug=false] 
     * @returns {{ message: any; attributes: types.TypeAttributes; isCap: any; isVtec: boolean; isCapDescription: any; awipsType: any; isApi: boolean; ignore: boolean; }} 
     */
    public static validate(stanza: any, isDebug: boolean | types.TypeAttributes = false) {
        if (isDebug !== false) { 
            const vTypes = isDebug as types.TypeAttributes;
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
                    const isApi = false;
                    this.cache({ message, attributes, isCap, isVtec, awipsType: awipsType.type, awipsPrefix: awipsType.prefix });
                    return { message, attributes, isCap, isApi, isVtec, isUGC, isCapDescription, awipsType: awipsType, ignore: false };
                }
            }
        }
        return { message: null, attributes: null, isApi: null, isCap: null, isVtec: null, isUGC: null, isCapDescription: null, awipsType: null, ignore: true };
    }

    /**
     * getType determines the AWIPS type of the alert based on its attributes, specifically the awipsid.
     * If no matching type is found, it defaults to 'default'.
     *
     * @private
     * @static
     * @param {unknown} attributes 
     * @returns {*} 
     */
    private static getType(attributes: unknown) {
        const attrs = attributes as types.TypeAttributes;
        if (!attrs || !attrs.awipsid) return {type: `XX`, prefix: `XX`};
        for (const [prefix, type] of Object.entries(loader.definitions.awips)) {
            if (attrs.awipsid.startsWith(prefix)) { return {type: type, prefix: prefix}; }
        }
        return {type: `XX`, prefix: `XX`};
    }

    /**
     * cache stores the compiled alert data into a cache file if caching is enabled in the settings.
     *
     * @private
     * @static
     * @param {unknown} compiled 
     */
    private static cache(compiled: unknown) {
        const data = compiled as types.TypeCompiled;
        const settings = loader.settings as types.ClientSettings;
        if (!settings.NoaaWeatherWireService.cache.directory) return;
        if (!loader.packages.fs.existsSync(settings.NoaaWeatherWireService.cache.directory)) { loader.packages.fs.mkdirSync(settings.NoaaWeatherWireService.cache.directory, { recursive: true }); }
        data.message = data.message.replace(/\$\$/g, `\nSTANZA ATTRIBUTES...${JSON.stringify(data.attributes)}\nISSUED TIME...${new Date().toISOString()}\n$$$\n`);
        if (!data.message.includes(`STANZA ATTRIBUTES...`)) {
            data.message += `\nSTANZA ATTRIBUTES...${JSON.stringify(data.attributes)}\nISSUED TIME...${new Date().toISOString()}\n$$\n`;
        }
        loader.packages.fs.appendFileSync(`${settings.NoaaWeatherWireService.cache.directory}/category-${data.awipsPrefix}-${data.awipsType}s-${data.isCap ? `cap` : `raw`}${data.isVtec ? `-vtec` : ``}.bin`,`=================================================\n${new Date().toISOString().replace(/[:.]/g, '-')}\n=================================================\n${data.message}`, 'utf8');
        loader.packages.fs.appendFileSync(`${settings.NoaaWeatherWireService.cache.directory}/cache-${data.isCap ? `cap` : `raw`}${data.isVtec ? `-vtec` : ``}.bin`,`=================================================\n${new Date().toISOString().replace(/[:.]/g, '-')}\n=================================================\n${data.message}`, 'utf8');
    }
    
}

export default StanzaParser;