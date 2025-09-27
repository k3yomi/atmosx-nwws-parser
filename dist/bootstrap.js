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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.definitions = exports.settings = exports.cache = exports.statics = exports.packages = void 0;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var events = __importStar(require("events"));
var xmpp = __importStar(require("@xmpp/client"));
var shapefile = __importStar(require("shapefile"));
var xml2js = __importStar(require("xml2js"));
var better_sqlite3_1 = __importDefault(require("better-sqlite3"));
exports.packages = { fs: fs, path: path, events: events, xmpp: xmpp, shapefile: shapefile, xml2js: xml2js, sqlite3: better_sqlite3_1.default };
exports.statics = {
    events: new events.EventEmitter(),
    session: null,
    db: null,
};
exports.cache = {
    lastStanza: Date.now(),
    session: null,
    lastConnect: null,
    sigHault: false,
    isConnected: false,
    attemptingReconnect: false,
    totalReconnects: 0
};
exports.settings = {
    alertSettings: {
        ugcPolygons: false,
        onlyCap: false,
        betterEvents: false,
        expiryCheck: true,
        filteredAlerts: [],
    },
    xmpp: {
        reconnect: true,
        reconnectInterval: 60,
    },
    cacheSettings: {
        readCache: false,
        maxMegabytes: 1,
        cacheDir: null,
    },
    database: path.join(process.cwd(), 'shapefiles.db'),
};
exports.definitions = {
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
        "Small Craft Warning": "Small Craft Warning",
    },
    awips: { SWOMCD: "mesoscale-discussion", LSR: "local-storm-report", SPS: "special-weather-statement" },
    expressions: {
        vtec: "[OTEX].(NEW|CON|EXT|EXA|EXB|UPG|CAN|EXP|COR|ROU).[A-Z]{4}.[A-Z]{2}.[WAYSFON].[0-9]{4}.[0-9]{6}T[0-9]{4}Z-[0-9]{6}T[0-9]{4}Z",
        wmo: "[A-Z0-9]{6}\\s[A-Z]{4}\\s\\d{6}",
        ugc1: "(\\w{2}[CZ](\\d{3}((-|>)\\s?(\n\n)?))+)",
        ugc2: "(\\d{6}(-|>)\\s?(\n\n)?)",
        dateline: "/d{3,4}s*(AM|PM)?s*[A-Z]{2,4}s+[A-Z]{3,}s+[A-Z]{3,}s+d{1,2}s+d{4}"
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
        { error: "error-connection-lost", message: "The connection to the XMPP server has been lost. Please try reconnecting manually as the automatic reconnect feature is not setup for offline hault conditions." },
    ],
    messages: {
        shapefile_creation: "\n\n[NOTICE] DO NOT CLOSE THIS PROJECT UNTIL THE SHAPEFILES ARE DONE COMPLETING!\n\t THIS COULD TAKE A WHILE DEPENDING ON THE SPEED OF YOUR STORAGE!!\n\t IF YOU CLOSE YOUR PROJECT, THE SHAPEFILES WILL NOT BE CREATED AND YOU WILL NEED TO DELETE ".concat(exports.settings.database, " AND RESTART TO CREATE THEM AGAIN!\n\n"),
        shapefile_creation_finished: "\n\n[NOTICE] SHAPEFILES HAVE BEEN SUCCESSFULLY CREATED AND THE DATABASE IS READY FOR USE!\n\n"
    }
};
