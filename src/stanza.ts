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
import mEvents from './events';


export class mStanza {

    /**
      * @function validate
      * @description Validates an incoming XMPP stanza to determine if it contains relevant weather alert information. 
      * If valid, it extracts and returns key details such as the message content, attributes, and alert type.
      * 
      * @param {any} stanza - The incoming XMPP stanza to validate.
      * @param {any} isDebug - Optional parameter for debugging purposes. If provided, it treats the input as a debug object.
      * 
      */

    static validate (stanza: any, isDebug: any = false) {
        if ( isDebug != false ) {
            const message = stanza;
            const attributes = isDebug;
            const isCap = isDebug.isCap;
            const hasCapDescription = stanza.includes(`<areaDesc>`);
            const hasVTEC = stanza.match(loader.definitions.expressions.vtec) != null;
            const getAwipsType = this.getAwipsType(isDebug);
            return { message, attributes, isDebug, isCap, hasCapDescription, hasVTEC, getAwipsType, ignore: false }
        }
        if (stanza.is(`message`)) {
            let cb = stanza.getChild(`x`)
            if (cb?.children) { 
                const message = cb.children[0];
                const attributes = cb.attrs;
                const isCap = message.includes(`<?xml version="1.0"`);
                const hasCapDescription = message.includes(`<areaDesc>`);
                const hasVTEC = message.match(loader.definitions.expressions.vtec) != null;
                const getAwipsType = this.getAwipsType(attributes);
                this.saveToCache({ message, attributes, isCap, hasVTEC, getAwipsType });
                return { message, attributes, isCap, hasCapDescription, hasVTEC, getAwipsType, ignore: false }
            }   
        }
        return { ignore: true };
    }

    /** 
      * @function getAwipsType
      * @description Determines the AWIPS type of a weather alert based on its attributes. 
      * It checks the 'awipsid' attribute against known prefixes to classify the alert type.
      * 
      * @param {any} attributes - The attributes of the weather alert stanza.
      */

    static getAwipsType (attributes: any) {
        if (!attributes || !attributes.awipsid) return `unknown`;
        for (let [prefix, type] of Object.entries(loader.definitions.awips)) {
            if (attributes.awipsid.startsWith(prefix)) return type;
        }
        return `default`;
    }

    /** 
      * @function create
      * @description Processes a validated weather alert stanza and triggers the appropriate event based on its type.
      * 
      * @param {any} stanzaData - The validated weather alert stanza data.
      */

    static create (stanzaData: any) {
        if (stanzaData.getAwipsType == `default` && stanzaData.hasVTEC && stanzaData.isCap) { return mEvents.newCapAlerts(stanzaData) } // Default alert - CAP Only
        if (stanzaData.getAwipsType == `default` && stanzaData.hasVTEC && !stanzaData.isCap) { return mEvents.newRawAlerts(stanzaData) } // Default alert - NonCAP
        if (stanzaData.getAwipsType == `default` && !stanzaData.hasVTEC && !stanzaData.isCap) { return mEvents.newUnknownAlert(stanzaData) } // Default alert - NonCAP, NonVTEC
        if (stanzaData.getAwipsType == `special-weather-statement`) { return mEvents.newSpecialWeatherStatement(stanzaData) } // SPW (Special Weather Statement)
        if (stanzaData.getAwipsType == `mesoscale-discussion`) { return mEvents.newMesoscaleDiscussion(stanzaData) } // MD (Mesoscale Discussion)
        if (stanzaData.getAwipsType == `local-storm-report`) { return mEvents.newLocalStormReport(stanzaData) } // LSR (Local Storm Report)
    }

    /** 
      * @function saveToCache
      * @description Saves the weather alert stanza to a cache file for record-keeping and debugging purposes.
      * 
      * @param {any} stanzaData - The weather alert stanza data to be saved.
      */

    static saveToCache (stanzaData: any) {
        if (!loader.settings.cacheSettings.cacheDir) return;
        stanzaData.message = stanzaData.message.replace(/\$\$/g, `\nISSUED TIME...${new Date().toISOString()}\n$$$\n`);
        loader.packages.fs.appendFileSync(`${loader.settings.cacheSettings.cacheDir}/category-${stanzaData.getAwipsType}s-${stanzaData.isCap ? `cap` : `raw`}${stanzaData.hasVTEC ? `-vtec` : ``}.bin`, `=================================================\n${new Date().toISOString().replace(/[:.]/g, '-')}\n=================================================\n${stanzaData.message}`, 'utf8');
    }
}

export default mStanza;

