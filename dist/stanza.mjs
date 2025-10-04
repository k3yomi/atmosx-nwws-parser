var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// bootstrap.ts
import * as fs from "fs";
import * as path from "path";
import * as events from "events";
import * as xmpp from "@xmpp/client";
import * as shapefile from "shapefile";
import * as xml2js from "xml2js";
import sqlite3 from "better-sqlite3";
var packages = { fs, path, events, xmpp, shapefile, xml2js, sqlite3 };
var statics = {
  events: new events.EventEmitter(),
  session: null,
  db: null
};
var cache = {
  lastStanza: Date.now(),
  session: null,
  lastConnect: null,
  sigHault: false,
  isConnected: false,
  attemptingReconnect: false,
  totalReconnects: 0
};
var settings = {
  alertSettings: {
    ugcPolygons: false,
    onlyCap: false,
    betterEvents: false,
    expiryCheck: true,
    filteredAlerts: []
  },
  xmpp: {
    reconnect: true,
    reconnectInterval: 60
  },
  cacheSettings: {
    readCache: false,
    maxMegabytes: 1,
    cacheDir: null
  },
  database: path.join(process.cwd(), "shapefiles.db")
};
var definitions = {
  events: { "AF": "Ashfall", "AS": "Air Stagnation", "BH": "Beach Hazard", "BW": "Brisk Wind", "BZ": "Blizzard", "CF": "Coastal Flood", "DF": "Debris Flow", "DS": "Dust Storm", "EC": "Extreme Cold", "EH": "Excessive Heat", "XH": "Extreme Heat", "EW": "Extreme Wind", "FA": "Areal Flood", "FF": "Flash Flood", "FG": "Dense Fog", "FL": "Flood", "FR": "Frost", "FW": "Fire Weather", "FZ": "Freeze", "GL": "Gale", "HF": "Hurricane Force Wind", "HT": "Heat", "HU": "Hurricane", "HW": "High Wind", "HY": "Hydrologic", "HZ": "Hard Freeze", "IS": "Ice Storm", "LE": "Lake Effect Snow", "LO": "Low Water", "LS": "Lakeshore Flood", "LW": "Lake Wind", "MA": "Special Marine", "MF": "Dense Fog", "MH": "Ashfall", "MS": "Dense Smoke", "RB": "Small Craft for Rough Bar", "RP": "Rip Current Risk", "SC": "Small Craft", "SE": "Hazardous Seas", "SI": "Small Craft for Winds", "SM": "Dense Smoke", "SQ": "Snow Squall", "SR": "Storm", "SS": "Storm Surge", "SU": "High Surf", "SV": "Severe Thunderstorm", "SW": "Small Craft for Hazardous Seas", "TO": "Tornado", "TR": "Tropical Storm", "TS": "Tsunami", "TY": "Typhoon", "UP": "Heavy Freezing Spray", "WC": "Wind Chill", "WI": "Wind", "WS": "Winter Storm", "WW": "Winter Weather", "ZF": "Freezing Fog", "ZR": "Freezing Rain", "ZY": "Freezing Spray" },
  actions: { "W": "Warning", "F": "Forecast", "A": "Watch", "O": "Outlook", "Y": "Advisory", "N": "Synopsis", "S": "Statement" },
  status: { "NEW": "Issued", "CON": "Updated", "EXT": "Extended", "EXA": "Extended", "EXB": "Extended", "UPG": "Upgraded", "COR": "Correction", "ROU": "Routine", "CAN": "Cancelled", "EXP": "Expired" },
  offshore: {
    "Special Weather Statement": "Special Weather Statement",
    "Hurricane Warning": "Hurricane Warning",
    "Hurricane Force Wind Warning": "Hurricane Force Wind Warning",
    "Hurricane Watch": "Hurricane Watch",
    "Tropical Storm Warning": "Tropical Storm Warning",
    "Tropical Storm Watch": "Tropical Storm Watch",
    "High Wind Warning": "High Wind Warning",
    "Gale Warning": "Gale Warning",
    "Small Craft Advisory": "Small Craft Advisory",
    "Small Craft Warning": "Small Craft Warning"
  },
  awips: { SWOMCD: `mesoscale-discussion`, LSR: `local-storm-report`, SPS: `special-weather-statement` },
  expressions: {
    vtec: `[OTEX].(NEW|CON|EXT|EXA|EXB|UPG|CAN|EXP|COR|ROU).[A-Z]{4}.[A-Z]{2}.[WAYSFON].[0-9]{4}.[0-9]{6}T[0-9]{4}Z-[0-9]{6}T[0-9]{4}Z`,
    wmo: `[A-Z0-9]{6}\\s[A-Z]{4}\\s\\d{6}`,
    ugc1: `(\\w{2}[CZ](\\d{3}((-|>)\\s?(

)?))+)`,
    ugc2: `(\\d{6}(-|>)\\s?(

)?)`,
    ugc3: `(\\d{6})(?=-|$)`,
    dateline: `/d{3,4}s*(AM|PM)?s*[A-Z]{2,4}s+[A-Z]{3,}s+[A-Z]{3,}s+d{1,2}s+d{4}`
  },
  tags: {
    "A LARGE AND EXTREMELY DANGEROUS TORNADO": "Large and Dangerous Tornado",
    "THIS IS A PARTICULARLY DANGEROUS SITUATION": "Particularly Dangerous Situation",
    "RADAR INDICATED ROTATION": "Radar Indicated Tornado",
    "WEATHER SPOTTERS CONFIRMED TORNADO": "Confirmed by Storm Spotters",
    "A SEVERE THUNDERSTORM CAPABLE OF PRODUCING A TORNADO": "Developing Tornado",
    "LAW ENFORCEMENT CONFIRMED TORNADO": "Reported by Law Enforcement",
    "A TORNADO IS ON THE GROUND": "Confirmed Tornado",
    "WEATHER SPOTTERS REPORTED FUNNEL CLOUD": "Confirmed Funnel Cloud by Storm Spotters",
    "PUBLIC CONFIRMED TORNADO": "Public reports of Tornado",
    "RADAR CONFIRMED": "Radar Confirmed",
    "TORNADO WAS REPORTED BRIEFLY ON THE GROUND": "Tornado no longer on ground",
    "SPOTTERS INDICATE THAT A FUNNEL CLOUD CONTINUES WITH THIS STORM": "Funnel Cloud Continues",
    "A TORNADO MAY DEVELOP AT ANY TIME": "Potentional still exists for Tornado to form",
    "LIFE-THREATENING SITUATION": "Life Threating Situation",
    "COMPLETE DESTRUCTION IS POSSIBLE": "Extremly Damaging Tornado",
    "POTENTIALLY DEADLY TORNADO": "Deadly Tornado",
    "RADAR INDICATED": "Radar Indicated",
    "HAIL DAMAGE TO VEHICLES IS EXPECTED": "Damaging to Vehicles",
    "EXPECT WIND DAMAGE": "Wind Damage",
    "FREQUENT LIGHTNING": "Frequent Lightning",
    "PEOPLE AND ANIMALS OUTDOORS WILL BE INJURED": "Capable of Injuring People and Animals",
    "TRAINED WEATHER SPOTTERS": "Confirmed by Storm Spotters",
    "SOURCE...PUBLIC": "Confirmed by Public",
    "SMALL CRAFT COULD BE DAMAGED": "Potential Damage to Small Craft",
    "A TORNADO WATCH REMAINS IN EFFECT": "Active Tornado Watch",
    "TENNIS BALL SIZE HAIL": "Tennis Ball Size Hail",
    "BASEBALL SIZE HAIL": "Baseball Size Hail",
    "GOLF BALL SIZE HAIL": "Golf Ball Size Hail",
    "QUARTER SIZE HAIL": "Quarter Size Hail",
    "PING PONG BALL SIZE HAIL": "Ping Pong Ball Size Hail",
    "NICKEL SIZE HAIL": "Nickel Size Hail",
    "DOPPLER RADAR.": "Confirmed by Radar",
    "DOPPLER RADAR AND AUTOMATED GAUGES.": "Confirmed by Radar and Gauges",
    "FLASH FLOODING CAUSED BY THUNDERSTORMS.": "Caused by Thunderstorm",
    "SOURCE...EMERGENCY MANAGEMENT.": "Confirmed by Emergency Management",
    "FLASH FLOODING CAUSED BY HEAVY RAIN.": "Caused by heavy rain",
    "SOURCE...LAW ENFORCEMENT REPORTED.": "Confirmed by Law Enforcement"
  },
  haultingConditions: [
    { error: "error-database-not-configured", message: "The database is not configured properly. Please set the database path in the constructor." },
    { error: "error-reconnecting-too-fast", message: "The client is attempting to reconnect too fast. Please wait a few seconds before trying again." },
    { error: "error-connection-lost", message: "The connection to the XMPP server has been lost. Please try reconnecting manually as the automatic reconnect feature is not setup for offline hault conditions." }
  ],
  messages: {
    shapefile_creation: `

[NOTICE] DO NOT CLOSE THIS PROJECT UNTIL THE SHAPEFILES ARE DONE COMPLETING!
	 THIS COULD TAKE A WHILE DEPENDING ON THE SPEED OF YOUR STORAGE!!
	 IF YOU CLOSE YOUR PROJECT, THE SHAPEFILES WILL NOT BE CREATED AND YOU WILL NEED TO DELETE ${settings.database} AND RESTART TO CREATE THEM AGAIN!

`,
    shapefile_creation_finished: `

[NOTICE] SHAPEFILES HAVE BEEN SUCCESSFULLY CREATED AND THE DATABASE IS READY FOR USE!

`
  }
};

// src/text-parser.ts
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

// src/ugc.ts
var mUgcParser = class {
  /**
    * @function getUGC
    * @description Extracts UGC codes and associated locations from a weather alert message.
    * 
    * @param {string} message - The full text message to search within.
    */
  static getUGC(message) {
    return __async(this, null, function* () {
      const header = this.getHeader(message);
      const zones = this.getZones(header);
      const expiry = this.getExpiry(message);
      const locations = yield this.getLocations(zones);
      const ugc = zones.length > 0 ? { zones, locations, expiry } : null;
      return ugc;
    });
  }
  /**
    * @function getHeader
    * @description Extracts the UGC header from a weather alert message.
    * 
    * @param {string} message - The full text message to search within.
    */
  static getHeader(message) {
    const start = message.search(new RegExp(definitions.expressions.ugc1, "gimu"));
    const end = message.substring(start).search(new RegExp(definitions.expressions.ugc2, "gimu"));
    const full = message.substring(start, start + end).replace(/\s+/g, "").slice(0, -1);
    return full;
  }
  static getExpiry(message) {
    const start = message.match(new RegExp(definitions.expressions.ugc3, "gimu"));
    if (start != null) {
      const day = parseInt(start[0].substring(0, 2), 10);
      const hour = parseInt(start[0].substring(2, 4), 10);
      const minute = parseInt(start[0].substring(4, 6), 10);
      const now = /* @__PURE__ */ new Date();
      const expires = new Date(now.getUTCFullYear(), now.getUTCMonth(), day, hour, minute, 0);
      return expires;
    }
    return null;
  }
  /**
    * @function getLocations
    * @description Retrieves location names from a database based on UGC zone codes.
    * 
    * @param {Array} zones - An array of UGC zone codes.
    */
  static getLocations(zones) {
    return __async(this, null, function* () {
      const locations = [];
      for (let i = 0; i < zones.length; i++) {
        const id = zones[i].trim();
        const statement = `SELECT location FROM shapefiles WHERE id = ?`;
        const located = yield statics.db.prepare(statement).get(id);
        located != void 0 ? locations.push(located.location) : locations.push(id);
      }
      return Array.from(new Set(locations)).sort();
    });
  }
  /**
    * @function getCoordinates
    * @description Retrieves geographical coordinates from a database based on UGC zone codes.
    * 
    * @param {Array} zones - An array of UGC zone codes.
    */
  static getCoordinates(zones) {
    let coordinates = [];
    for (let i = 0; i < zones.length; i++) {
      const id = zones[i].trim();
      const statement = `SELECT geometry FROM shapefiles WHERE id = ?`;
      let located = statics.db.prepare(statement).get(id);
      if (located != void 0) {
        let geometry = JSON.parse(located.geometry);
        if ((geometry == null ? void 0 : geometry.type) === "Polygon") {
          coordinates.push(...geometry.coordinates[0].map((coord) => [coord[0], coord[1]]));
          break;
        }
      }
    }
    return coordinates;
  }
  /**
    * @function getZones
    * @description Parses the UGC header to extract individual UGC zone codes, handling ranges and formats.
    * 
    * @param {string} header - The UGC header string.
    */
  static getZones(header) {
    const ugcSplit = header.split("-");
    const zones = [];
    let state = ugcSplit[0].substring(0, 2);
    let format = ugcSplit[0].substring(2, 3);
    for (let i = 0; i < ugcSplit.length; i++) {
      if (/^[A-Z]/.test(ugcSplit[i])) {
        state = ugcSplit[i].substring(0, 2);
        if (ugcSplit[i].includes(">")) {
          let [start, end] = ugcSplit[i].split(">"), startNum = parseInt(start.substring(3), 10), endNum = parseInt(end, 10);
          for (let j = startNum; j <= endNum; j++) zones.push(`${state}${format}${j.toString().padStart(3, "0")}`);
        } else zones.push(ugcSplit[i]);
        continue;
      }
      if (ugcSplit[i].includes(">")) {
        let [start, end] = ugcSplit[i].split(">"), startNum = parseInt(start, 10), endNum = parseInt(end, 10);
        for (let j = startNum; j <= endNum; j++) zones.push(`${state}${format}${j.toString().padStart(3, "0")}`);
      } else zones.push(`${state}${format}${ugcSplit[i]}`);
    }
    return zones.filter((item) => item !== "");
  }
};
var ugc_default = mUgcParser;

// src/vtec.ts
var mVtecParser = class {
  /**
    * @function getVTEC
    * @description Extracts VTEC information from a weather alert message.
    * 
    * @param {string} message - The full text message to search within.
    * @param {object} attributes - Additional attributes such as issue time.
    */
  static getVTEC(message, attributes) {
    const vtecs = [];
    const matches = message.match(new RegExp(definitions.expressions.vtec, "g"));
    if (!matches) return null;
    for (let i = 0; i < matches.length; i++) {
      const vtec = matches[i];
      const parts = vtec.split(`.`);
      const dates = parts[6].split(`-`);
      vtecs.push({
        handle: vtec,
        tracking: this.getTracking(parts),
        event: this.getEventName(parts),
        status: this.getEventStatus(parts),
        wmo: message.match(new RegExp(definitions.expressions.wmo, "gimu")),
        expires: this.getEventExpires(dates),
        issued: attributes.issue
      });
    }
    return vtecs;
  }
  /**
    * @function getTracking
    * @description Constructs a tracking code from VTEC parts.
    * 
    * @param {Array} args - An array of VTEC parts.
    */
  static getTracking(args) {
    return `${args[2]}-${args[3]}-${args[4]}-${args[5]}`;
  }
  /**
    * @function getEventName
    * @description Constructs an event name from VTEC parts.
    * 
    * @param {Array} args - An array of VTEC parts.
    */
  static getEventName(args) {
    return `${definitions.events[args[3]]} ${definitions.actions[args[4]]}`;
  }
  /**
    * @function getEventStatus
    * @description Retrieves the event status from VTEC parts.
    * 
    * @param {Array} args - An array of VTEC parts.
    */
  static getEventStatus(args) {
    return definitions.status[args[1]];
  }
  /**
    * @function getEventExpires
    * @description Constructs an expiration date-time string from VTEC date parts.
    * 
    * @param {Array} args - An array containing the start and end date-time strings.
    */
  static getEventExpires(args) {
    if (args[1] == `000000T0000Z`) return `Invalid Date Format`;
    const expires = `${(/* @__PURE__ */ new Date()).getFullYear().toString().substring(0, 2)}${args[1].substring(0, 2)}-${args[1].substring(2, 4)}-${args[1].substring(4, 6)}T${args[1].substring(7, 9)}:${args[1].substring(9, 11)}:00`;
    const local = new Date(new Date(expires).getTime() - 4 * 60 * 6e4);
    const pad = (n) => n.toString().padStart(2, "0");
    return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}:00.000-04:00`;
  }
};
var vtec_default = mVtecParser;

// src/events.ts
var mEvents = class {
  /** 
    * @function onEnhanced
    * @description Enhances the event name and tags of an alert object based on its description and parameters.
    * 
    * @param {Object} event - The alert object to be enhanced.
    * @return {Object} - The enhanced alert object with updated event name and tags.
    * @example
    * Severe Thunderstorm Warning with "Considerable" damage threat becomes "Considerable Severe Thunderstorm Warning"
    */
  static onEnhanced(event) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
    let tags = ["No tags found"];
    let eventName = (_b = (_a = event == null ? void 0 : event.properties) == null ? void 0 : _a.event) != null ? _b : "Unknown Event";
    const parameters = (_d = (_c = event == null ? void 0 : event.properties) == null ? void 0 : _c.parameters) != null ? _d : {};
    const dmgThreat = (_h = (_g = (_e = parameters.thunderstormDamageThreat) == null ? void 0 : _e[0]) != null ? _g : (_f = parameters.tornadoDamageThreat) == null ? void 0 : _f[0]) != null ? _h : "N/A";
    const torThreat = (_i = parameters.tornadoDetection) != null ? _i : "N/A";
    const description = (_m = (_l = (_k = (_j = event == null ? void 0 : event.properties) == null ? void 0 : _j.description) == null ? void 0 : _k.toLowerCase) == null ? void 0 : _l.call(_k)) != null ? _m : "No description available.";
    if (description.includes("flash flood emergency") && eventName === "Flash Flood Warning") {
      eventName = "Flash Flood Emergency";
    }
    if (description.includes("particularly dangerous situation") && eventName === "Tornado Warning" && dmgThreat === "CONSIDERABLE") {
      eventName = "PDS Tornado Warning";
    }
    if (description.includes("particularly dangerous situation") && eventName === "Tornado Watch") {
      eventName = "PDS Tornado Watch";
    }
    if (description.includes("extremely dangerous situation") && eventName === "Severe Thunderstorm Warning") {
      eventName = "EDS Severe Thunderstorm Warning";
    }
    if (description.includes("tornado emergency") && eventName === "Tornado Warning" && dmgThreat === "CATASTROPHIC") {
      eventName = "Tornado Emergency";
    }
    if (eventName === "Flash Flood Warning") {
      if (dmgThreat === "CONSIDERABLE") eventName = "Considerable Flash Flood Warning";
    }
    if (eventName === "Tornado Warning") {
      eventName = "Radar Indicated Tornado Warning";
      if (parameters.tornadoDetection === "RADAR INDICATED") eventName = "Radar Indicated Tornado Warning";
      if (parameters.tornadoDetection === "OBSERVED") eventName = "Confirmed Tornado Warning";
    }
    if (eventName === "Severe Thunderstorm Warning") {
      if (dmgThreat === "CONSIDERABLE") eventName = "Considerable Severe Thunderstorm Warning";
      if (dmgThreat === "DESTRUCTIVE") eventName = "Destructive Severe Thunderstorm Warning";
      if (torThreat === "POSSIBLE") eventName = `${eventName} (TPROB)`;
    }
    for (const [key, value] of Object.entries(definitions.tags)) {
      if (description.includes(key.toLowerCase())) {
        if (tags.includes("No tags found")) tags = [];
        if (!tags.includes(value)) tags.push(value);
      }
    }
    return { eventName, tags };
  }
  /**
    * @function onFinished
    * @description Processes and filters alert objects before emitting the 'onAlert' event. Based on settings, it can enhance event names, filter alerts, and check for expiry.
    * 
    * @param {Array} alerts - An array of alert objects to be processed.
    * 
    * @emits onAlert - Emitted when alerts are processed and ready.
    */
  static onFinished(alerts) {
    if (settings.alertSettings.betterEvents) {
      for (let i = 0; i < alerts.length; i++) {
        const { eventName, tags } = this.onEnhanced(alerts[i]);
        alerts[i].properties.event = eventName;
        alerts[i].properties.tags = tags;
      }
    }
    if (settings.alertSettings.filteredAlerts && Array.isArray(settings.alertSettings.filteredAlerts) && settings.alertSettings.filteredAlerts.length > 0) {
      const pSet = new Set(settings.alertSettings.filteredAlerts.map((p) => String(p).toLowerCase()));
      alerts = alerts.filter((alert) => {
        var _a, _b;
        return pSet.has(String((_b = (_a = alert == null ? void 0 : alert.properties) == null ? void 0 : _a.event) != null ? _b : "").toLowerCase());
      });
    }
    if (settings.alertSettings.expiryCheck) {
      alerts = alerts.filter((alert) => {
        var _a;
        return new Date((_a = alert == null ? void 0 : alert.properties) == null ? void 0 : _a.expires) > /* @__PURE__ */ new Date();
      });
    }
    if (!alerts || alerts.length === 0) {
      return;
    }
    statics.events.emit("onAlert", alerts);
  }
  /** 
    * @function newCapAlerts
    * @description Emits the 'onAlert' event with parsed CAP alert objects. (XML Format)
    * The alert objects contain various properties such as id, tracking, action, area description, expiration time,
    * issue time, event type, sender information, description, geocode, and parameters like WMO identifier,
    * tornado detection, max hail size, max wind gust, and thunderstorm damage threat.
    * 
    * @param {Object} stanza - The XMPP stanza containing the CAP alert message.
    * 
    * @emits onAlert - Emitted when a new CAP alert is received and parsed.
    */
  static newCapAlerts(stanza) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const messages = ((_a = stanza.message.match(/<\?xml[\s\S]*?<\/alert>/g)) == null ? void 0 : _a.map((xml) => xml.trim())) || [];
      let alerts = [];
      for (let i = 0; i < messages.length; i++) {
        const pStartTime = (/* @__PURE__ */ new Date()).getTime();
        const message = messages[i].substring(messages[i].indexOf(`<?xml version="1.0"`), messages[i].lastIndexOf(`>`) + 1);
        let data = new packages.xml2js.Parser();
        let parsed = yield data.parseStringPromise(message);
        let tracking = ((_b = parsed.alert.info[0].parameter.find((p) => p.valueName[0] === "VTEC")) == null ? void 0 : _b.value[0]) || "N/A";
        let action = "N/A";
        if (tracking !== "N/A") {
          let splitVTEC = tracking.split(".");
          tracking = `${splitVTEC[2]}-${splitVTEC[3]}-${splitVTEC[4]}-${splitVTEC[5]}`;
          action = definitions.status[splitVTEC[1]];
        } else {
          action = parsed.alert.msgType[0];
          tracking = `${(_c = parsed.alert.info[0].parameter.find((p) => p.valueName[0] === "WMOidentifier")) == null ? void 0 : _c.value[0]}-${parsed.alert.info[0].area[0].geocode.filter((g) => g.valueName[0] === "UGC").map((g) => g.value[0]).join("-")}`;
        }
        let getTimeIssued = new Date(stanza.attributes.issue);
        if (getTimeIssued == `Invalid Date`) {
          getTimeIssued = (/* @__PURE__ */ new Date()).getTime();
        }
        if (getTimeIssued != null) {
          getTimeIssued = new Date(getTimeIssued).toLocaleString();
        }
        let alert = {
          hitch: `${(/* @__PURE__ */ new Date()).getTime() - pStartTime}ms`,
          id: tracking,
          tracking,
          action,
          history: [{ description: parsed.alert.info[0].description[0], action, issued: getTimeIssued }],
          properties: {
            areaDesc: parsed.alert.info[0].area[0].areaDesc[0],
            expires: new Date(parsed.alert.info[0].expires[0]),
            sent: new Date(parsed.alert.sent[0]),
            messageType: action,
            event: parsed.alert.info[0].event[0],
            sender: parsed.alert.sender[0],
            senderName: parsed.alert.info[0].senderName[0],
            description: parsed.alert.info[0].description[0],
            geocode: {
              UGC: parsed.alert.info[0].area[0].geocode.filter((g) => g.valueName[0] === "UGC").map((g) => g.value[0])
            },
            parameters: {
              WMOidentifier: [((_d = parsed.alert.info[0].parameter.find((p) => p.valueName[0] === "WMOidentifier")) == null ? void 0 : _d.value[0]) || "N/A"],
              tornadoDetection: ((_e = parsed.alert.info[0].parameter.find((p) => p.valueName[0] === "tornadoDetection")) == null ? void 0 : _e.value[0]) || ((_f = parsed.alert.info[0].parameter.find((p) => p.valueName[0] === "waterspoutDetection")) == null ? void 0 : _f.value[0]) || "N/A",
              maxHailSize: ((_g = parsed.alert.info[0].parameter.find((p) => p.valueName[0] === "maxHailSize")) == null ? void 0 : _g.value[0]) || "N/A",
              maxWindGust: ((_h = parsed.alert.info[0].parameter.find((p) => p.valueName[0] === "maxWindGust")) == null ? void 0 : _h.value[0]) || "N/A",
              thunderstormDamageThreat: [((_i = parsed.alert.info[0].parameter.find((p) => p.valueName[0] === "thunderstormDamageThreat")) == null ? void 0 : _i.value[0]) || ((_j = parsed.alert.info[0].parameter.find((p) => p.valueName[0] === "tornadoDamageThreat")) == null ? void 0 : _j.value[0]) || "N/A"]
            }
          }
        };
        if (parsed.alert.info[0].area[0].polygon) {
          alert.geometry = {
            type: "Polygon",
            coordinates: [
              parsed.alert.info[0].area[0].polygon[0].split(" ").map((coord) => {
                let [lat, lon] = coord.split(",").map(parseFloat);
                return [lon, lat];
              })
            ]
          };
        }
        alerts.push(alert);
      }
      this.onFinished(alerts);
    });
  }
  /**
    * @function newRawAlerts
    * @description Emits the 'onAlert' event with parsed raw alert objects.
    * The alert objects contain various properties such as id, tracking, action, area description, expiration time,
    * issue time, event type, sender information, description, geocode, and parameters like WMO identifier,
    * tornado detection, max hail size, max wind gust, and thunderstorm damage threat.
    * 
    * @param {Object} stanza - The XMPP stanza containing the raw alert message.
    * 
    * @emits onAlert - Emitted when a new raw alert is received and parsed.
    */
  static newRawAlerts(stanza) {
    return __async(this, null, function* () {
      var _a;
      const messages = stanza.message.split(/(?=\$\$)/g).map((msg) => msg.trim());
      let defaultWMO = stanza.message.match(new RegExp(definitions.expressions.wmo, "gimu"));
      let alerts = [];
      for (let i = 0; i < messages.length; i++) {
        const pStartTime = (/* @__PURE__ */ new Date()).getTime();
        const message = messages[i];
        const mVtec = yield vtec_default.getVTEC(message, stanza.attributes);
        const mUgc = yield ugc_default.getUGC(message);
        if (mVtec != null && mUgc != null) {
          for (let v = 0; v < mVtec.length; v++) {
            let vtec = mVtec[v];
            if (vtec.wmo) {
              defaultWMO = vtec.wmo;
            }
            const getTornado = text_parser_default.getString(message, `TORNADO...`) || text_parser_default.getString(message, `WATERSPOUT...`) || `N/A`;
            const getHailSize = text_parser_default.getString(message, `MAX HAIL SIZE...`, [`IN`]) || text_parser_default.getString(message, `HAIL...`, [`IN`]) || `N/A`;
            const getWindGusts = text_parser_default.getString(message, `MAX WIND GUST...`) || text_parser_default.getString(message, `WIND...`) || `N/A`;
            const getDamageThreat = text_parser_default.getString(message, `DAMAGE THREAT...`) || `N/A`;
            const getForecastOffice = text_parser_default.getForecastOffice(message) || vtec.tracking.split(`-`)[0] || `NWS`;
            const getPolygonCoordinates = text_parser_default.getPolygonCoordinates(message);
            const getDescription = text_parser_default.getCleanDescription(message, vtec.handle);
            let getTimeIssued = text_parser_default.getString(message, `ISSUED TIME...`);
            if (getTimeIssued == null) {
              getTimeIssued = new Date(stanza.attributes.issue).getTime();
            }
            if (getTimeIssued == null) {
              getTimeIssued = (/* @__PURE__ */ new Date()).getTime();
            }
            if (getTimeIssued != null) {
              getTimeIssued = new Date(getTimeIssued).toLocaleString();
            }
            let alert = {
              hitch: `${(/* @__PURE__ */ new Date()).getTime() - pStartTime}ms`,
              id: vtec.tracking,
              tracking: vtec.tracking,
              action: vtec.status,
              history: [{ description: getDescription, action: vtec.status, issued: getTimeIssued }],
              properties: {
                areaDesc: mUgc.locations.join(`; `) || "N/A",
                expires: isNaN(new Date(vtec.expires).getTime()) ? new Date(9999, 0, 1) : new Date(vtec.expires),
                sent: new Date(getTimeIssued),
                messageType: vtec.status,
                event: vtec.event || "Unknown Event",
                sender: getForecastOffice,
                senderName: getForecastOffice,
                description: getDescription || "No description available.",
                geocode: {
                  UGC: mUgc.zones || []
                },
                parameters: {
                  WMOidentifier: ((_a = vtec.wmo) == null ? void 0 : _a[0]) ? [vtec.wmo[0]] : (defaultWMO == null ? void 0 : defaultWMO[0]) ? [defaultWMO[0]] : [`N/A`],
                  tornadoDetection: getTornado,
                  maxHailSize: getHailSize,
                  maxWindGust: getWindGusts,
                  thunderstormDamageThreat: [getDamageThreat]
                }
              },
              geometry: { type: "Polygon", coordinates: [getPolygonCoordinates] }
            };
            if (settings.alertSettings.ugcPolygons) {
              const ugcCoordinates = ugc_default.getCoordinates(mUgc.zones);
              if (ugcCoordinates.length > 0) {
                alert.geometry = { type: "Polygon", coordinates: [ugcCoordinates] };
              }
              ;
            }
            alerts.push(alert);
          }
        }
      }
      this.onFinished(alerts);
    });
  }
  /**
    * @function newUnknownAlert
    * @description Emits the 'onAlert' event with parsed unknown alert objects. (Non-CAP, Non-VTEC)
    * The alert objects contain various properties such as id, tracking, action, area description, expiration time,
    * issue time, event type, sender information, description, geocode, and parameters like WMO identifier,
    * tornado detection, max hail size, max wind gust, and thunderstorm damage threat.
    * 
    * @param {Object} stanza - The XMPP stanza containing the raw alert message.
    * 
    * @emits onAlert - Emitted when a new raw alert is received and parsed.
    */
  static newUnknownAlert(stanza) {
    return __async(this, null, function* () {
      const messages = stanza.message.split(/(?=\$\$)/g).map((msg) => msg.trim());
      let defaultWMO = stanza.message.match(new RegExp(definitions.expressions.wmo, "gimu"));
      let alerts = [];
      for (let i = 0; i < messages.length; i++) {
        const pStartTime = (/* @__PURE__ */ new Date()).getTime();
        const message = messages[i];
        const mUgc = yield ugc_default.getUGC(message);
        const isOffshoreEvent = Object.keys(definitions.offshore).some((event) => message.toLowerCase().includes(event.toLowerCase()));
        if (mUgc != null && isOffshoreEvent != false) {
          const getForecastOffice = text_parser_default.getForecastOffice(message) || `NWS`;
          const getPolygonCoordinates = text_parser_default.getPolygonCoordinates(message);
          const getDescription = text_parser_default.getCleanDescription(message, null);
          let getTimeIssued = text_parser_default.getString(message, `ISSUED TIME...`);
          if (getTimeIssued == null) {
            getTimeIssued = new Date(stanza.attributes.issue).getTime();
          }
          if (getTimeIssued == null) {
            getTimeIssued = (/* @__PURE__ */ new Date()).getTime();
          }
          if (getTimeIssued != null) {
            getTimeIssued = new Date(getTimeIssued).toLocaleString();
          }
          let alert = {
            hitch: `${(/* @__PURE__ */ new Date()).getTime() - pStartTime}ms`,
            id: defaultWMO ? `${defaultWMO[0]}-${mUgc.zones.join(`-`)}` : `N/A`,
            tracking: defaultWMO ? `${defaultWMO[0]}-${mUgc.zones.join(`-`)}` : `N/A`,
            action: `Issued`,
            history: [{ description: getDescription, action: `Issued`, issued: getTimeIssued }],
            properties: {
              areaDesc: mUgc.locations.join(`; `) || "N/A",
              expires: new Date(mUgc.expiry != null ? mUgc.expiry : (/* @__PURE__ */ new Date()).getTime() + 1 * 60 * 60 * 1e3),
              sent: new Date(getTimeIssued),
              messageType: `Issued`,
              event: Object.keys(definitions.offshore).find((event) => message.toLowerCase().includes(event.toLowerCase())) || "Unknown Event",
              sender: getForecastOffice,
              senderName: getForecastOffice,
              description: getDescription || "No description available.",
              geocode: {
                UGC: mUgc.zones || []
              },
              parameters: {
                WMOidentifier: (defaultWMO == null ? void 0 : defaultWMO[0]) ? [defaultWMO[0]] : [`N/A`],
                tornadoDetection: `N/A`,
                maxHailSize: `N/A`,
                maxWindGust: `N/A`,
                thunderstormDamageThreat: [`N/A`]
              }
            },
            geometry: { type: "Polygon", coordinates: [getPolygonCoordinates] }
          };
          if (settings.alertSettings.ugcPolygons) {
            const ugcCoordinates = ugc_default.getCoordinates(mUgc.zones);
            if (ugcCoordinates.length > 0) {
              alert.geometry = { type: "Polygon", coordinates: [ugcCoordinates] };
            }
            ;
          }
          alerts.push(alert);
        }
      }
      this.onFinished(alerts);
    });
  }
  /** 
    * @function newSpecialWeatherStatement
    * @description Emits the 'onAlert' event with parsed special weather statement alert objects.
    * The alert objects contain various properties such as id, tracking, action, area description, expiration time,
    * issue time, event type, sender information, description, geocode, and parameters like WMO identifier,
    * 
    * tornado detection, max hail size, max wind gust, and thunderstorm damage threat.
    * 
    * @param {Object} stanza - The XMPP stanza containing the special weather statement message.
    * 
    * @emits onAlert - Emitted when a new special weather statement is received and parsed.
    */
  static newSpecialWeatherStatement(stanza) {
    return __async(this, null, function* () {
      const messages = stanza.message.split(/(?=\$\$)/g).map((msg) => msg.trim());
      let defaultWMO = stanza.message.match(new RegExp(definitions.expressions.wmo, "gimu"));
      let alerts = [];
      for (let i = 0; i < messages.length; i++) {
        const pStartTime = (/* @__PURE__ */ new Date()).getTime();
        const message = messages[i];
        const mUgc = yield ugc_default.getUGC(message);
        if (mUgc != null) {
          const getTornado = text_parser_default.getString(message, `TORNADO...`) || text_parser_default.getString(message, `WATERSPOUT...`) || `N/A`;
          const getHailSize = text_parser_default.getString(message, `MAX HAIL SIZE...`, [`IN`]) || text_parser_default.getString(message, `HAIL...`, [`IN`]) || `N/A`;
          const getWindGusts = text_parser_default.getString(message, `MAX WIND GUST...`) || text_parser_default.getString(message, `WIND...`) || `N/A`;
          const getDamageThreat = text_parser_default.getString(message, `DAMAGE THREAT...`) || `N/A`;
          const getForecastOffice = text_parser_default.getForecastOffice(message) || `NWS`;
          const getPolygonCoordinates = text_parser_default.getPolygonCoordinates(message);
          const getDescription = text_parser_default.getCleanDescription(message, null);
          let getTimeIssued = text_parser_default.getString(message, `ISSUED TIME...`);
          if (getTimeIssued == null) {
            getTimeIssued = new Date(stanza.attributes.issue).getTime();
          }
          if (getTimeIssued == null) {
            getTimeIssued = (/* @__PURE__ */ new Date()).getTime();
          }
          if (getTimeIssued != null) {
            getTimeIssued = new Date(getTimeIssued).toLocaleString();
          }
          let alert = {
            hitch: `${(/* @__PURE__ */ new Date()).getTime() - pStartTime}ms`,
            id: defaultWMO ? `${defaultWMO[0]}-${mUgc.zones.join(`-`)}` : `N/A`,
            tracking: defaultWMO ? `${defaultWMO[0]}-${mUgc.zones.join(`-`)}` : `N/A`,
            action: `Issued`,
            history: [{ description: getDescription, action: `Issued`, issued: getTimeIssued }],
            properties: {
              areaDesc: mUgc.locations.join(`; `) || "N/A",
              expires: new Date(mUgc.expiry != null ? mUgc.expiry : (/* @__PURE__ */ new Date()).getTime() + 1 * 60 * 60 * 1e3),
              sent: new Date(getTimeIssued),
              messageType: `Issued`,
              event: `Special Weather Statement`,
              sender: getForecastOffice,
              senderName: getForecastOffice,
              description: getDescription || "No description available.",
              geocode: {
                UGC: mUgc.zones || []
              },
              parameters: {
                WMOidentifier: (defaultWMO == null ? void 0 : defaultWMO[0]) ? [defaultWMO[0]] : [`N/A`],
                tornadoDetection: getTornado,
                maxHailSize: getHailSize,
                maxWindGust: getWindGusts,
                thunderstormDamageThreat: [getDamageThreat]
              }
            },
            geometry: { type: "Polygon", coordinates: [getPolygonCoordinates] }
          };
          if (settings.alertSettings.ugcPolygons) {
            const ugcCoordinates = ugc_default.getCoordinates(mUgc.zones);
            if (ugcCoordinates.length > 0) {
              alert.geometry = { type: "Polygon", coordinates: [ugcCoordinates] };
            }
            ;
          }
          alerts.push(alert);
        }
      }
      this.onFinished(alerts);
    });
  }
  /** 
    * @function newMesoscaleDiscussion
    * @description Emits the 'onMesoscaleDiscussion' event with a parsed mesoscale discussion alert object.
    * The alert object contains various properties such as id, tracking, action, area description, expiration time,
    * issue time, event type, sender information, description, geocode, and parameters like WMO identifier,
    * tornado intensity probability, peak wind gust, and peak hail size.
    * 
    * @param {Object} stanza - The XMPP stanza containing the mesoscale discussion message.
    * 
    * @emits onMesoscaleDiscussion - Emitted when a new mesoscale discussion is received and parsed.
    */
  static newMesoscaleDiscussion(stanza) {
    return __async(this, null, function* () {
      const messages = stanza.message.split(/(?=\$\$)/g).map((msg) => msg.trim());
      let defaultWMO = stanza.message.match(new RegExp(definitions.expressions.wmo, "gimu"));
      for (let i = 0; i < messages.length; i++) {
        const pStartTime = (/* @__PURE__ */ new Date()).getTime();
        const message = messages[i];
        const mUgc = yield ugc_default.getUGC(message);
        if (mUgc != null) {
          const getForecastOffice = text_parser_default.getForecastOffice(message) || `NWS`;
          const getDescription = text_parser_default.getCleanDescription(message, null);
          const getTornadoIntensity = text_parser_default.getString(message, `MOST PROBABLE PEAK TORNADO INTENSITY...`) || `N/A`;
          const getPeakWindGust = text_parser_default.getString(message, `MOST PROBABLE PEAK WIND GUST...`) || `N/A`;
          const getPeakHailSize = text_parser_default.getString(message, `MOST PROBABLE PEAK HAIL SIZE...`) || `N/A`;
          let getTimeIssued = text_parser_default.getString(message, `ISSUED TIME...`);
          if (getTimeIssued == null) {
            getTimeIssued = new Date(stanza.attributes.issue).getTime();
          }
          if (getTimeIssued == null) {
            getTimeIssued = (/* @__PURE__ */ new Date()).getTime();
          }
          if (getTimeIssued != null) {
            getTimeIssued = new Date(getTimeIssued).toLocaleString();
          }
          let alert = {
            hitch: `${(/* @__PURE__ */ new Date()).getTime() - pStartTime}ms`,
            id: defaultWMO ? `${defaultWMO[0]}-${mUgc.zones.join(`-`)}` : `N/A`,
            tracking: defaultWMO ? `${defaultWMO[0]}-${mUgc.zones.join(`-`)}` : `N/A`,
            action: `Issued`,
            history: [],
            properties: {
              areaDesc: mUgc.locations.join(`; `) || "N/A",
              expires: new Date((/* @__PURE__ */ new Date()).getTime() + 2 * 60 * 60 * 1e3),
              sent: new Date(getTimeIssued),
              messageType: `Issued`,
              event: `Mesoscale Discussion`,
              sender: getForecastOffice,
              senderName: getForecastOffice,
              description: getDescription || "No description available.",
              geocode: {
                UGC: mUgc.zones || []
              },
              parameters: {
                WMOidentifier: (defaultWMO == null ? void 0 : defaultWMO[0]) ? [defaultWMO[0]] : [`N/A`],
                tornadoIntensityProbability: getTornadoIntensity,
                peakWindGust: getPeakWindGust,
                peakHailSize: getPeakHailSize
              }
            }
          };
          statics.events.emit("onMesoscaleDiscussion", alert);
        }
      }
    });
  }
  /**
    * @function newLocalStormReport
    * @description Emits the 'onLocalStormReport' event with the cleaned description of a local storm report. No other additional parsing is 
    * done at this time at least.
    * 
    * @param {Object} stanza - The XMPP stanza containing the local storm report message.
    * 
    * @emits onLocalStormReport - Emitted when a new local storm report is received and parsed.
    */
  static newLocalStormReport(stanza) {
    return __async(this, null, function* () {
      statics.events.emit("onLocalStormReport", text_parser_default.getCleanDescription(stanza.message, null));
    });
  }
};
var events_default = mEvents;

// src/stanza.ts
var mStanza = class {
  /**
    * @function validate
    * @description Validates an incoming XMPP stanza to determine if it contains relevant weather alert information. 
    * If valid, it extracts and returns key details such as the message content, attributes, and alert type.
    * 
    * @param {any} stanza - The incoming XMPP stanza to validate.
    * @param {any} isDebug - Optional parameter for debugging purposes. If provided, it treats the input as a debug object.
    * 
    */
  static validate(stanza, isDebug = false) {
    if (isDebug != false) {
      const message = stanza;
      const attributes = isDebug;
      const isCap = isDebug.isCap;
      const hasCapDescription = stanza.includes(`<areaDesc>`);
      const hasVTEC = stanza.match(definitions.expressions.vtec) != null;
      const getAwipsType = this.getAwipsType(isDebug);
      return { message, attributes, isDebug, isCap, hasCapDescription, hasVTEC, getAwipsType, ignore: false };
    }
    if (stanza.is(`message`)) {
      let cb = stanza.getChild(`x`);
      if (cb == null ? void 0 : cb.children) {
        const message = cb.children[0];
        const attributes = cb.attrs;
        const isCap = message.includes(`<?xml version="1.0"`);
        const hasCapDescription = message.includes(`<areaDesc>`);
        const hasVTEC = message.match(definitions.expressions.vtec) != null;
        const getAwipsType = this.getAwipsType(attributes);
        this.saveToCache({ message, attributes, isCap, hasVTEC, getAwipsType });
        return { message, attributes, isCap, hasCapDescription, hasVTEC, getAwipsType, ignore: false };
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
  static getAwipsType(attributes) {
    if (!attributes || !attributes.awipsid) return `unknown`;
    for (let [prefix, type] of Object.entries(definitions.awips)) {
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
  static create(stanzaData) {
    if (stanzaData.getAwipsType == `default` && stanzaData.hasVTEC && stanzaData.isCap) {
      return events_default.newCapAlerts(stanzaData);
    }
    if (stanzaData.getAwipsType == `default` && stanzaData.hasVTEC && !stanzaData.isCap) {
      return events_default.newRawAlerts(stanzaData);
    }
    if (stanzaData.getAwipsType == `default` && !stanzaData.hasVTEC && !stanzaData.isCap) {
      return events_default.newUnknownAlert(stanzaData);
    }
    if (stanzaData.getAwipsType == `special-weather-statement`) {
      return events_default.newSpecialWeatherStatement(stanzaData);
    }
    if (stanzaData.getAwipsType == `mesoscale-discussion`) {
      return events_default.newMesoscaleDiscussion(stanzaData);
    }
    if (stanzaData.getAwipsType == `local-storm-report`) {
      return events_default.newLocalStormReport(stanzaData);
    }
  }
  /** 
    * @function saveToCache
    * @description Saves the weather alert stanza to a cache file for record-keeping and debugging purposes.
    * 
    * @param {any} stanzaData - The weather alert stanza data to be saved.
    */
  static saveToCache(stanzaData) {
    if (!settings.cacheSettings.cacheDir) return;
    stanzaData.message = stanzaData.message.replace(/\$\$/g, `
ISSUED TIME...${(/* @__PURE__ */ new Date()).toISOString()}
$$$
`);
    packages.fs.appendFileSync(`${settings.cacheSettings.cacheDir}/category-${stanzaData.getAwipsType}s-${stanzaData.isCap ? `cap` : `raw`}${stanzaData.hasVTEC ? `-vtec` : ``}.bin`, `=================================================
${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}
=================================================
${stanzaData.message}`, "utf8");
  }
};
var stanza_default = mStanza;
export {
  stanza_default as default,
  mStanza
};
