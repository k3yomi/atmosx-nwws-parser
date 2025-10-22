export const EVENTS: Record<string, string> = {
    "AF": "Ashfall",
    "AS": "Air Stagnation",
    "BH": "Beach Hazard",
    "BW": "Brisk Wind",
    "BZ": "Blizzard",
    "CF": "Coastal Flood",
    "DF": "Debris Flow",
    "DS": "Dust Storm",
    "EC": "Extreme Cold",
    "EH": "Excessive Heat",
    "XH": "Extreme Heat",
    "EW": "Extreme Wind",
    "FA": "Areal Flood",
    "FF": "Flash Flood",
    "FG": "Dense Fog",
    "FL": "Flood",
    "FR": "Frost",
    "FW": "Fire Weather",
    "FZ": "Freeze",
    "GL": "Gale",
    "HF": "Hurricane Force Wind",
    "HT": "Heat",
    "HU": "Hurricane",
    "HW": "High Wind",
    "HY": "Hydrologic",
    "HZ": "Hard Freeze",
    "IS": "Ice Storm",
    "LE": "Lake Effect Snow",
    "LO": "Low Water",
    "LS": "Lakeshore Flood",
    "LW": "Lake Wind",
    "MA": "Special Marine",
    "EQ": "Earthquake",
    "MF": "Dense Fog",
    "MH": "Ashfall",
    "MS": "Dense Smoke",
    "RB": "Small Craft for Rough Bar",
    "RP": "Rip Current Risk",
    "SC": "Small Craft",
    "SE": "Hazardous Seas",
    "SI": "Small Craft for Winds",
    "SM": "Dense Smoke",
    "SQ": "Snow Squall",
    "SR": "Storm",
    "SS": "Storm Surge",
    "SU": "High Surf",
    "SV": "Severe Thunderstorm",
    "SW": "Small Craft for Hazardous Seas",
    "TO": "Tornado",
    "TR": "Tropical Storm",
    "TS": "Tsunami",
    "TY": "Typhoon",
    "SP": "Special Weather",
    "UP": "Heavy Freezing Spray",
    "WC": "Wind Chill",
    "WI": "Wind",
    "WS": "Winter Storm",
    "WW": "Winter Weather",
    "ZF": "Freezing Fog",
    "ZR": "Freezing Rain",
    "ZY": "Freezing Spray"
};

export const ACTIONS: Record<string, string> = {
    "W": "Warning", 
    "F": "Forecast", 
    "A": "Watch", 
    "O": "Outlook", 
    "Y": "Advisory", 
    "N": "Synopsis", 
    "S": "Statement"
}


export const STATUS: Record<string, string> = {
    "NEW": "Issued", 
    "CON": "Updated", 
    "EXT": "Extended", 
    "EXA": "Extended", 
    "EXB": "Extended",
    "UPG": "Upgraded", 
    "COR": "Correction", 
    "ROU": "Routine", 
    "CAN": "Cancelled", 
    "EXP": "Expired" 
}

export const TYPES: Record<string, string> = {
    "O": "Operational Product",
    "T": "Test Product",
    "E": "Experimental Product",
    "X": "Experimental Product (Non-Operational)",
}

export const STATUS_CORRELATIONS: {type: string, forward: string, cancel: boolean, update: boolean, new: boolean}[] = [
    {type: "Update", forward: "Updated", cancel: false, update: true, new: false},
    {type: "Cancel", forward: "Cancelled", cancel: true, update: false, new: false},
    {type: "Alert", forward: "Issued", cancel: false, update: false, new: true},
    {type: "Updated", forward: "Updated", cancel: false, update: true, new: false},
    {type: "Expired", forward: "Expired", cancel: true, update: false, new: false},
    {type: "Issued", forward: "Issued", cancel: false, update: false, new: true},
    {type: "Extended", forward: "Updated", cancel: false, update: true, new: false},
    {type: "Correction", forward: "Updated", cancel: false, update: true, new: false},
    {type: "Upgraded", forward: "Upgraded", cancel: false, update: true, new: false},
    {type: "Cancelled", forward: "Cancelled", cancel: true, update: false, new: false},
    {type: "Routine", forward: "Routine", cancel: false, update: true, new: false},
]

export const CAUSES : Record<string, string> = {
    "SM": "Snow Melt",
    "RS": "Rain/Snow Melt",
    "ER": "Excessive Rain",
    "DM": "Dam/Levee Failure",
    "IJ": "Ice Jam",
    "GO": "Glacier Lake Outburst",
    "IC": "Ice",
    "FS": "Flash Flood / Storm Surge",
    "FT": "Tidal Effects",
    "ET": "Elevated Upstream Flow",
    "MC": "Other Multiple Causes",
    "WT": "Wind and/or Tidal Effects",
    "DR": "Reservoir Release",
    "UU": "Unknown",
    "OT": "Other Effects"
}

export const RECORDS: Record<string, string> = {
    "NO": "No Record Expected",
    "NR": "Near Record or possible record",
    "UU": "Unknown history of records",
    "OO": "Other",
}

export const SEVERITY: Record<string, string> = {
    N: "Not Expected",
    0: "Areal Flood or FF Product",
    1: "Minor",
    2: "Moderate",
    3: "Major",
    U: "Unknown",
}
