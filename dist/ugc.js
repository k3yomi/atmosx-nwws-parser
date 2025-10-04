var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
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

// src/ugc.ts
var ugc_exports = {};
__export(ugc_exports, {
  default: () => ugc_default,
  mUgcParser: () => mUgcParser
});
module.exports = __toCommonJS(ugc_exports);

// bootstrap.ts
var path = __toESM(require("path"));
var events = __toESM(require("events"));
var xmpp = __toESM(require("@xmpp/client"));
var shapefile = __toESM(require("shapefile"));
var xml2js = __toESM(require("xml2js"));
var import_better_sqlite3 = __toESM(require("better-sqlite3"));
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  mUgcParser
});
