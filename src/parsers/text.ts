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

export class TextParser {
    
    /**
     * textProductToString extracts a specific value from a text-based weather product message based on a given key and optional removal strings.
     *
     * @public
     * @static
     * @param {string} message 
     * @param {string} value 
     * @param {string[]} [removal=[]] 
     * @returns {(string | null)} 
     */
    public static textProductToString(message: string,value: string,removal: string[] = []): string | null {
        const lines = message.split('\n');
        for (const line of lines) {
            if (line.includes(value)) {
                let result = line.slice(line.indexOf(value) + value.length).trim();
                for (const str of removal) { result = result.split(str).join(''); }
                result = result.replace(value, '').replace('<', '').trim();
                return result || null;
            }
        }
        return null;
    }
    
    /**
     * textProductToPolygon extracts geographical coordinates from a text-based weather product message and returns them as an array of [longitude, latitude] pairs.
     *
     * @public
     * @static
     * @param {string} message 
     * @returns {[number, number][]} 
     */
    public static textProductToPolygon(message: string): [number, number][] {
        const coordinates: [number, number][] = [];
        const latLonMatch = message.match(/LAT\.{3}LON\s+([\d\s]+)/i);
        if (!latLonMatch || !latLonMatch[1]) return coordinates;
        const coordStrings = latLonMatch[1].replace(/\n/g, ' ').trim().split(/\s+/);
        for (let i = 0; i < coordStrings.length - 1; i += 2) {
            const lat = parseFloat(coordStrings[i]) / 100;
            const lon = -parseFloat(coordStrings[i + 1]) / 100;
            if (!isNaN(lat) && !isNaN(lon)) { coordinates.push([lat, lon]); }
        }
        if (coordinates.length > 2) { coordinates.push(coordinates[0]); }
        return coordinates;
    }

    /**
     * textProductToDescription extracts the main description from a text-based weather product message.
     *
     * @public
     * @static
     * @param {string} message 
     * @param {string} [handle=null] 
     * @returns {string} 
     */
    public static textProductToDescription(message: string, handle: string = null): string {
        const original = message;
        const dateRegex = /\d{3,4}\s*(AM|PM)?\s*[A-Z]{2,4}\s+[A-Z]{3,}\s+[A-Z]{3,}\s+\d{1,2}\s+\d{4}/gim;
        const discoveredDates = Array.from(message.matchAll(dateRegex));
        if (discoveredDates.length) {
            const lastMatch = discoveredDates[discoveredDates.length - 1][0];
            const startIdx = message.lastIndexOf(lastMatch);
            if (startIdx !== -1) {
                const endIdx = message.indexOf('&&', startIdx);
                message = message.substring(startIdx + lastMatch.length, endIdx !== -1 ? endIdx : undefined).trimStart();
                if (message.startsWith('/')) message = message.slice(1).trimStart();
                if (handle && message.includes(handle)) {
                    const handleIdx = message.indexOf(handle);
                    message = message.substring(handleIdx + handle.length).trimStart();
                    if (message.startsWith('/')) message = message.slice(1).trimStart();
                }
            }
        } else if (handle) {
            const handleIdx = message.indexOf(handle);
            if (handleIdx !== -1) {
                let afterHandle = message.substring(handleIdx + handle.length).trimStart();
                if (afterHandle.startsWith('/')) afterHandle = afterHandle.slice(1).trimStart();
                const latEnd = afterHandle.indexOf('&&')
                message = latEnd !== -1 ? afterHandle.substring(0, latEnd).trim() : afterHandle.trim();
            }
        }
        return message.replace(/\s+/g, ' ').trim().startsWith('STANZA ATTRIBUTES...') ? original : message.split('STANZA ATTRIBUTES...')[0].trim();
    }

    /**
     * awipTextToEvent converts an AWIPS ID prefix from a text-based weather product message to its corresponding event type and prefix.
     *
     * @public
     * @static
     * @param {string} message 
     * @returns {{ type: any; prefix: any; }} 
     */
    public static awipTextToEvent(message: string): Record<string, string> {
        for (const [prefix, type] of Object.entries(loader.definitions.awips)) {
            if (message.startsWith(prefix)) {
                return {type: type, prefix: prefix};
            }
        }
        return {type: `XX`, prefix: `XX`};
    }
    
    /**
     * getXmlValues recursively searches a parsed XML object for specified keys and extracts their values.
     *
     * @public
     * @static
     * @param {*} parsed 
     * @param {string[]} valuesToExtract 
     * @returns {Record<string, any>} 
     */
    public static getXmlValues(parsed: any, valuesToExtract: string[]): Record<string, string> {
        const extracted: Record<string, any> = {};   
        const findValueByKey = (obj: any, searchKey: string) => {
            const results = [];
            if (obj === null || typeof obj !== 'object') {
                return results;
            }
            const searchKeyLower = searchKey.toLowerCase();
            for (const key in obj) {
                if (obj.hasOwnProperty(key) && key.toLowerCase() === searchKeyLower) {
                    results.push(obj[key]);
                }
            }
            if (Array.isArray(obj)) {
                for (const item of obj) {
                    if (item.valueName && item.valueName.toLowerCase() === searchKeyLower && item.value !== undefined) {
                        results.push(item.value);
                    }
                    const nestedResults = findValueByKey(item, searchKey);
                    results.push(...nestedResults);
                }
            }
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const nestedResults = findValueByKey(obj[key], searchKey);
                    results.push(...nestedResults);
                }
            }
            return results;
        };
        for (const key of valuesToExtract) {
            const values = findValueByKey(parsed.alert, key);
            const uniqueValues = [...new Set(values)];
            extracted[key] = uniqueValues.length === 0 ? null : (uniqueValues.length === 1 ? uniqueValues[0] : uniqueValues);
        }
        return extracted;
    }
    
}

export default TextParser;