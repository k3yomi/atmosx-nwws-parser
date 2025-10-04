var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/text-parser.ts
var text_parser_exports = {};
__export(text_parser_exports, {
  default: () => text_parser_default,
  mTextParser: () => mTextParser
});
module.exports = __toCommonJS(text_parser_exports);
var mTextParser = class {
  /**
    * @function getString
    * @description Extracts a substring from a message based on a specified starting string and optional removal patterns.
    * 
    * @param {string} message - The full text message to search within.
    * @param {string} string - The starting string to look for in the message.
    * @param {Array|string|null} removal - Optional patterns (string or array of strings) to remove from the extracted substring.
    */
  static getString(message, string, removal = null) {
    const lines = message.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(string)) {
        const start = lines[i].indexOf(string) + string.length;
        let result = lines[i].substring(start).trim();
        if (Array.isArray(removal)) {
          for (let j = 0; j < removal.length; j++) {
            result = result.replace(removal[j], "");
          }
        }
        return result.replace(string, "").replace(/^\s+|\s+$/g, "").replace("<", "").trim();
      }
    }
    return null;
  }
  /**
    * @function getEventCode
    * @description Extracts the event code from a weather alert message.
    * 
    * @param {string} message - The full text message to search within.
    */
  static getForecastOffice(message) {
    return this.getString(message, `National Weather Service`) || this.getString(message, `NWS STORM PREDICTION CENTER `) || null;
  }
  /**
    * @function getEventCode
    * @description Extracts the event code from a weather alert message.
    * 
    * @param {string} message - The full text message to search within.
    */
  static getPolygonCoordinates(message) {
    let coordinates = [];
    let latLon = message.match(/LAT\.{3}LON\s+([\d\s]+)/i);
    if (latLon && latLon[1]) {
      let coordStrings = latLon[1].replace(/\n/g, " ").trim().split(/\s+/);
      for (let i = 0; i < coordStrings.length - 1; i += 2) {
        let lat = parseFloat(coordStrings[i]) / 100;
        let long = -1 * (parseFloat(coordStrings[i + 1]) / 100);
        if (!isNaN(lat) && !isNaN(long)) {
          coordinates.push([long, lat]);
        }
      }
      if (coordinates.length > 2) {
        coordinates.push(coordinates[0]);
      }
    }
    return coordinates;
  }
  /**
    * @function getCleanDescription
    * @description Cleans the description text of a weather alert message by removing headers, footers, and extraneous information.
    * 
    * @param {string} message - The full text message to clean.
    * @param {string} handle - The VTEC handle to help identify the start of the main content.
    */
  static getCleanDescription(message, handle) {
    let originalMessage = message;
    let dateLineMatches = Array.from(message.matchAll(/\d{3,4}\s*(AM|PM)?\s*[A-Z]{2,4}\s+[A-Z]{3,}\s+[A-Z]{3,}\s+\d{1,2}\s+\d{4}/gim));
    if (dateLineMatches.length) {
      let dateLineMatch = dateLineMatches[dateLineMatches.length - 1];
      let nwsStart = message.lastIndexOf(dateLineMatch[0]);
      if (nwsStart !== -1) {
        let latStart = message.indexOf("&&", nwsStart);
        message = latStart !== -1 ? message.substring(nwsStart + dateLineMatch[0].length, latStart).trim() : message.substring(nwsStart + dateLineMatch[0].length).trim();
        if (message.startsWith("/")) message = message.substring(1).trim();
        if (handle && handle && message.includes(handle)) {
          let vtecIndex = message.indexOf(handle);
          if (vtecIndex !== -1) {
            message = message.substring(vtecIndex + handle.length).trim();
            if (message.startsWith("/")) message = message.substring(1).trim();
          }
        }
      }
    } else if (handle && handle) {
      let vtecStart = message.indexOf(handle);
      if (vtecStart !== -1) {
        let afterVtec = message.substring(vtecStart + handle.length);
        if (afterVtec.startsWith("/")) afterVtec = afterVtec.substring(1);
        let latStart = afterVtec.indexOf("&&");
        message = latStart !== -1 ? afterVtec.substring(0, latStart).trim() : afterVtec.trim();
      }
    }
    if (message.replace(/\s+/g, " ").trim().startsWith(`ISSUED TIME...`)) {
      message = originalMessage;
    }
    return message;
  }
};
var text_parser_default = mTextParser;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  mTextParser
});
