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

let loader = require(`../bootstrap.js`);

class NoaaWeatherWireServiceStanza { 

    /**
      * @function newStanza
      * @description Creates a new alert stanza from the provided message and attributes.
      * 
      * @param {object} stanza - The stanza object containing message and attributes.
      * @param {boolean} isDebug - Optional debug information.
      */

    newStanza = function(stanza, isDebug=false) {
        try {
            if (isDebug != false) {
                let message = isDebug.stanza
                let attributes = isDebug.attrs;
                let isCap = isDebug.isCap || message.includes(`<?xml version="1.0"`);
                let hasCapArea = message.includes(`<areaDesc>`);
                let hasVtec = message.match(loader.definitions.expressions.vtec) != null;
                let getId = this.getAwipsType(attributes)
                return { message: message, attributes: attributes, isCap: isCap, hasCapArea: hasCapArea, hasVtec: hasVtec, id: getId, ignore: false } 
            }
            if (stanza.is(`message`)) { 
                let cb = stanza.getChild(`x`);
                if (cb?.children) {
                    let message = cb.children[0];
                    let attributes = cb.attrs;
                    let isCap = message.includes(`<?xml version="1.0"`)
                    let hasCapArea = message.includes(`<areaDesc>`);
                    let hasVtec = message.match(loader.definitions.expressions.vtec) != null;
                    let getId = this.getAwipsType(attributes)
                    this.saveCache(message, attributes, getId, isCap, hasVtec);
                    return { message: message, attributes: attributes, isCap: isCap, hasCapArea: hasCapArea, hasVtec: hasVtec, id: getId, ignore: false }
                }
            }
            return { message: null, arrtributes: null, isCap: null, hasCapArea: null, hasVtec: null, id: null, ignore: true}
        } catch (error) {
            console.error(`[!] Error in newStanza: ${error.stack}`);
            return { message: null, arrtributes: null, isCap: null, hasCapArea: null, hasVtec: null, id: null, ignore: true }
        }
    }

    /**
      * @function getAwipsType
      * @description Determines the AWIPS type based on the attributes of the message.
      * 
      * @param {object} attributes - The attributes of the message.
      */

    getAwipsType = function(attributes) {
        if (!attributes || !attributes.awipsid) return `unknown`;
        for (let [prefix, type] of Object.entries(loader.definitions.awips)) { if (attributes.awipsid.startsWith(prefix)) return type; }
        return `default`;
    }

    /**
      * @function createNewAlert
      * @description Creates a new alert based on the stanza type and its properties.
      * 
      * @param {object} stanza - The stanza object containing message and attributes.
      */

    createNewAlert = async function(stanza) { 
        let type = stanza.id
        let cap = stanza.isCap;
        let vtec = stanza.hasVtec; 
        if (type == `default` && vtec && !cap) { loader.packages.mEvents.newRawProductEvent(stanza); return; }
        if (type == `default` && vtec && cap) { loader.packages.mEvents.newCapEvent(stanza); return; }
        if (type == `special-weather-statement`) { loader.packages.mEvents.newSpecialEvent(stanza); return; }
        if (type == `mesoscale-discussion`) { loader.packages.mEvents.newMesoscaleDiscussion(stanza); return; }
        if (type == `local-storm-report`) { loader.packages.mEvents.newStormReport(stanza); return; }
    }

    /**
      * @function saveCache
      * @description Saves the raw message to a cache file for later reference.
      * 
      * @param {string} message - The message to save.
      * @param {string} type - The type of the message (e.g., alert, warning).
      * @param {boolean} isCap - Indicates if the message is in CAP format.
      */

    saveCache = function(message, attributes, type, isCap, isVtec) {
        if (!loader.settings.cacheSettings.cacheDir) return;
        loader.packages.fs.appendFileSync(`${loader.settings.cacheSettings.cacheDir}/nwws-raw-category-${type}s-${isCap ? 'cap' : 'raw'}${isVtec ? '-vtec' : ''}.bin`, `=================================================\n${new Date().toISOString().replace(/[:.]/g, '-')}\n=================================================\n\n${message}\nISSUED TIME...${new Date(attributes.issue).toISOString()}\n\n`, 'utf8');
    }
}

module.exports = new NoaaWeatherWireServiceStanza();