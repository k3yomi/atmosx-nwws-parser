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
     * @function textProductToString
     * @description
     *     Searches a text product message for a line containing a specific value,
     *     extracts the substring immediately following that value, and optionally
     *     removes additional specified strings. Cleans up the extracted string by
     *     trimming whitespace and removing any remaining occurrences of the search
     *     value or '<' characters.
     *
     * @static
     * @param {string} message
     *     The raw text product message to search.
     * @param {string} value
     *     The string to search for within each line of the message.
     * @param {string[]} [removal=[]]
     *     Optional array of substrings to remove from the extracted result.
     *
     * @returns {string | null}
     *     The cleaned-up extracted string if found, or `null` if the value does
     *     not exist in the message.
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
     * @function textProductToPolygon
     * @description
     *     Parses a text product message to extract polygon coordinates based on
     *     LAT...LON data. Coordinates are converted to [latitude, longitude] pairs
     *     with longitude negated (assumes Western Hemisphere). If the polygon has
     *     more than two points, the first point is repeated at the end to close it.
     *
     * @static
     * @param {string} message
     *     The raw text product message containing LAT...LON coordinate data.
     *
     * @returns {[number, number][]}
     *     An array of [latitude, longitude] coordinate pairs forming the polygon.
     *     Returns an empty array if no valid coordinates are found.
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
     * @function textProductToDescription
     * @description
     *     Extracts a clean description portion from a text product message, optionally
     *     removing a handle and any extra metadata such as "STANZA ATTRIBUTES...".
     *     Also trims and normalizes whitespace.
     *
     * @static
     * @param {string} message
     *     The raw text product message to process.
     * @param {string | null} [handle=null]
     *     An optional handle string to remove from the message.
     *
     * @returns {string}
     *     The extracted description text from the message.
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
     * @function awipTextToEvent
     * @description
     *     Maps the beginning of a message string to a known AWIPS event type based on
     *     predefined prefixes. Returns a default value if no matching prefix is found.
     *
     * @static
     * @param {string} message
     *     The message string to analyze for an AWIPS prefix.
     *
     * @returns {Record<string, string>}
     *     An object containing:
     *       - `type`: The mapped AWIPS event type (or 'XX' if not found).
     *       - `prefix`: The matched prefix (or 'XX' if not found).
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
     * @function getXmlValues
     * @description
     *     Recursively extracts specified values from a parsed XML-like object.
     *     Searches both object keys and array items for matching keys (case-insensitive)
     *     and returns the corresponding values. If multiple unique values are found for
     *     a key, an array is returned; if one value is found, it returns that value; 
     *     if none are found, returns `null`.
     *
     * @static
     * @param {any} parsed
     *     The parsed XML object, typically resulting from an XML-to-JS parser.
     * @param {string[]} valuesToExtract
     *     Array of key names to extract values for from the parsed object.
     *
     * @returns {Record<string, string | string[] | null>}
     *     An object mapping each requested key to its extracted value(s) or `null`.
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