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

// src/vtec.ts
var vtec_exports = {};
__export(vtec_exports, {
  default: () => vtec_default,
  mVtecParser: () => mVtecParser
});
module.exports = __toCommonJS(vtec_exports);

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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  mVtecParser
});
