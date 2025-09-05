module.exports = {
    cache: {},
    settings: {},
    static: {},
    packages: {},
    definitions: {}
}

module.exports.packages = {
    fs: require(`fs`),
    path: require(`path`),
    events: require(`events`),
    xmpp: require(`@xmpp/client`),
    shapefile: require(`shapefile`),
    xml2js: require(`xml2js`),
    sqlite3: require(`better-sqlite3`),
    mStanza: require(`./src/stanza.js`),
    mVtec: require(`./src/vtec.js`),
    mUGC: require(`./src/ugc.js`),
    mText: require(`./src/text.js`),
    mEvents: require(`./src/events.js`),

}

module.exports.definitions = {
    events: { "AF": "Ashfall", "AS": "Air Stagnation", "BH": "Beach Hazard", "BW": "Brisk Wind", "BZ": "Blizzard", "CF": "Coastal Flood", "DF": "Debris Flow", "DS": "Dust Storm", "EC": "Extreme Cold", "EH": "Excessive Heat", "XH": "Extreme Heat", "EW": "Extreme Wind", "FA": "Areal Flood", "FF": "Flash Flood", "FG": "Dense Fog", "FL": "Flood", "FR": "Frost", "FW": "Fire Weather", "FZ": "Freeze", "GL": "Gale", "HF": "Hurricane Force Wind", "HT": "Heat", "HU": "Hurricane", "HW": "High Wind", "HY": "Hydrologic", "HZ": "Hard Freeze", "IS": "Ice Storm", "LE": "Lake Effect Snow", "LO": "Low Water", "LS": "Lakeshore Flood", "LW": "Lake Wind", "MA": "Special Marine", "MF": "Dense Fog", "MH": "Ashfall", "MS": "Dense Smoke", "RB": "Small Craft for Rough Bar", "RP": "Rip Current Risk", "SC": "Small Craft", "SE": "Hazardous Seas", "SI": "Small Craft for Winds", "SM": "Dense Smoke", "SQ": "Snow Squall", "SR": "Storm", "SS": "Storm Surge", "SU": "High Surf", "SV": "Severe Thunderstorm", "SW": "Small Craft for Hazardous Seas", "TO": "Tornado", "TR": "Tropical Storm", "TS": "Tsunami", "TY": "Typhoon", "UP": "Heavy Freezing Spray", "WC": "Wind Chill", "WI": "Wind", "WS": "Winter Storm", "WW": "Winter Weather", "ZF": "Freezing Fog", "ZR": "Freezing Rain", "ZY": "Freezing Spray" },
    actions: { "W": "Warning", "F": "Forecast", "A": "Watch", "O": "Outlook", "Y": "Advisory", "N": "Synopsis", "S": "Statement"},
    status: { "NEW": "Issued", "CON": "Updated", "EXT": "Extended", "EXA": "Extended", "EXB": "Extended", "UPG": "Upgraded", "COR": "Correction", "ROU": "Routine", "CAN": "Cancelled", "EXP": "Expired" },
    awips: { SWOMCD: `mesoscale-discussion`, LSR: `local-storm-report`, SPS: `special-weather-statement`, LSR: "local-storm-report"},
    expressions: {
        vtec: `[OTEX].(NEW|CON|EXT|EXA|EXB|UPG|CAN|EXP|COR|ROU).[A-Z]{4}.[A-Z]{2}.[WAYSFON].[0-9]{4}.[0-9]{6}T[0-9]{4}Z-[0-9]{6}T[0-9]{4}Z`,
        wmo: `[A-Z0-9]{6}\\s[A-Z]{4}\\s\\d{6}`,
        ugc1: `(\\w{2}[CZ](\\d{3}((-|>)\\s?(\n\n)?))+)`,
        ugc2: `(\\d{6}(-|>)\\s?(\n\n)?)`,
        dateline: `/\d{3,4}\s*(AM|PM)?\s*[A-Z]{2,4}\s+[A-Z]{3,}\s+[A-Z]{3,}\s+\d{1,2}\s+\d{4}`
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
        { error: "not-authorized", message: "You do not have the proper credentials to access this service.", code: "credential-error"},
        { error: "unreachable-host", message: "The host could not be reached. Please check your internet connection or the host address.", code: "xmpp-error" },
        { error: "service-error", message: "An error occurred while connecting to the NOAA Weather Wire Service. Please try again later.", code: "xmpp-error" },
        { error: "no-database-dir", message: "Database directory is not set. Please set the databaseDir in the metadata.", code: "no-database" },
        { error: "rapid-reconnect", message: "The client is reconnecting too rapidly. Please wait a moment before trying again.", code: "xmpp-error" }
    ]
}
module.exports.settings = { 
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
        cacheDir: false,
    },
    database: module.exports.packages.path.join(process.cwd(), 'shapefiles.db'), 
};
module.exports.cache = { 
    lastStanza: new Date().getTime(), 
    session: null, 
    sigHault: false,
    isConnected: false, 
    attemptingReconnect: false, 
    totalReconnects: 0 
};

module.exports.static.events = new module.exports.packages.events.EventEmitter();