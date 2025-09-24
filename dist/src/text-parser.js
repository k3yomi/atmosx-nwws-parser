"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mTextParser = void 0;
var mTextParser = /** @class */ (function () {
    function mTextParser() {
    }
    /**
      * @function getString
      * @description Extracts a substring from a message based on a specified starting string and optional removal patterns.
      *
      * @param {string} message - The full text message to search within.
      * @param {string} string - The starting string to look for in the message.
      * @param {Array|string|null} removal - Optional patterns (string or array of strings) to remove from the extracted substring.
      */
    mTextParser.getString = function (message, string, removal) {
        if (removal === void 0) { removal = null; }
        var lines = message.split('\n');
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].includes(string)) {
                var start = lines[i].indexOf(string) + string.length;
                var result = lines[i].substring(start).trim();
                if (Array.isArray(removal)) {
                    for (var j = 0; j < removal.length; j++) {
                        result = result.replace(removal[j], '');
                    }
                }
                return result.replace(string, '').replace(/^\s+|\s+$/g, '').replace('<', '').trim();
            }
        }
        return null;
    };
    /**
      * @function getEventCode
      * @description Extracts the event code from a weather alert message.
      *
      * @param {string} message - The full text message to search within.
      */
    mTextParser.getForecastOffice = function (message) {
        return this.getString(message, "National Weather Service") || this.getString(message, "NWS STORM PREDICTION CENTER ") || null;
    };
    /**
      * @function getEventCode
      * @description Extracts the event code from a weather alert message.
      *
      * @param {string} message - The full text message to search within.
      */
    mTextParser.getPolygonCoordinates = function (message) {
        var coordinates = [];
        var latLon = message.match(/LAT\.{3}LON\s+([\d\s]+)/i);
        if (latLon && latLon[1]) {
            var coordStrings = latLon[1].replace(/\n/g, ' ').trim().split(/\s+/);
            for (var i = 0; i < coordStrings.length - 1; i += 2) {
                var lat = parseFloat(coordStrings[i]) / 100;
                var long = -1 * (parseFloat(coordStrings[i + 1]) / 100);
                if (!isNaN(lat) && !isNaN(long)) {
                    coordinates.push([long, lat]);
                }
            }
            if (coordinates.length > 2) {
                coordinates.push(coordinates[0]);
            }
        }
        return coordinates;
    };
    /**
      * @function getCleanDescription
      * @description Cleans the description text of a weather alert message by removing headers, footers, and extraneous information.
      *
      * @param {string} message - The full text message to clean.
      * @param {string} handle - The VTEC handle to help identify the start of the main content.
      */
    mTextParser.getCleanDescription = function (message, handle) {
        var dateLineMatches = Array.from(message.matchAll(/\d{3,4}\s*(AM|PM)?\s*[A-Z]{2,4}\s+[A-Z]{3,}\s+[A-Z]{3,}\s+\d{1,2}\s+\d{4}/gim));
        if (dateLineMatches.length) {
            var dateLineMatch = dateLineMatches[dateLineMatches.length - 1];
            var nwsStart = message.lastIndexOf(dateLineMatch[0]);
            if (nwsStart !== -1) {
                var latStart = message.indexOf("&&", nwsStart);
                message = latStart !== -1 ? message.substring(nwsStart + dateLineMatch[0].length, latStart).trim() : message.substring(nwsStart + dateLineMatch[0].length).trim();
                if (message.startsWith('/'))
                    message = message.substring(1).trim();
                if (handle && handle && message.includes(handle)) {
                    var vtecIndex = message.indexOf(handle);
                    if (vtecIndex !== -1) {
                        message = message.substring(vtecIndex + handle.length).trim();
                        if (message.startsWith('/'))
                            message = message.substring(1).trim();
                    }
                }
            }
        }
        else if (handle && handle) {
            var vtecStart = message.indexOf(handle);
            if (vtecStart !== -1) {
                var afterVtec = message.substring(vtecStart + handle.length);
                if (afterVtec.startsWith('/'))
                    afterVtec = afterVtec.substring(1);
                var latStart = afterVtec.indexOf("&&");
                message = latStart !== -1 ? afterVtec.substring(0, latStart).trim() : afterVtec.trim();
            }
        }
        return message;
    };
    return mTextParser;
}());
exports.mTextParser = mTextParser;
exports.default = mTextParser;
