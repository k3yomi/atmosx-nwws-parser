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

// src/dictionaries/signatures.ts
var signatures_exports = {};
__export(signatures_exports, {
  CANCEL_SIGNATURES: () => CANCEL_SIGNATURES,
  MESSAGE_SIGNATURES: () => MESSAGE_SIGNATURES,
  TAGS: () => TAGS
});
module.exports = __toCommonJS(signatures_exports);
var TAGS = {
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
};
var CANCEL_SIGNATURES = [
  "THIS_MESSAGE_IS_FOR_TEST_PURPOSES_ONLY",
  "this is a test",
  "subsided sufficiently for the advisory to be cancelled",
  "has been cancelled",
  "will be allowed to expire",
  "has diminished",
  "and no longer",
  "has been replaced",
  "The threat has ended",
  "has weakened below severe"
];
var MESSAGE_SIGNATURES = [
  { regex: /\r?\n/g, replacement: " " },
  { regex: /\s+/g, replacement: " " },
  { regex: /\*/g, replacement: "." },
  { regex: /\bUTC\b/g, replacement: "Coordinated Universal Time" },
  { regex: /\bGMT\b/g, replacement: "Greenwich Mean Time" },
  { regex: /\bEST\b/g, replacement: "Eastern Standard Time" },
  { regex: /\bEDT\b/g, replacement: "Eastern Daylight Time" },
  { regex: /\bCST\b/g, replacement: "Central Standard Time" },
  { regex: /\bCDT\b/g, replacement: "Central Daylight Time" },
  { regex: /\bMST\b/g, replacement: "Mountain Standard Time" },
  { regex: /\bMDT\b/g, replacement: "Mountain Daylight Time" },
  { regex: /\bPST\b/g, replacement: "Pacific Standard Time" },
  { regex: /\bPDT\b/g, replacement: "Pacific Daylight Time" },
  { regex: /\bAKST\b/g, replacement: "Alaska Standard Time" },
  { regex: /\bAKDT\b/g, replacement: "Alaska Daylight Time" },
  { regex: /\bHST\b/g, replacement: "Hawaii Standard Time" },
  { regex: /\bHDT\b/g, replacement: "Hawaii Daylight Time" },
  { regex: /\bmph\b/g, replacement: "miles per hour" },
  { regex: /\bkm\/h\b/g, replacement: "kilometers per hour" },
  { regex: /\bkmh\b/g, replacement: "kilometers per hour" },
  { regex: /\bkt\b/g, replacement: "knots" },
  { regex: /\bNE\b/g, replacement: "northeast" },
  { regex: /\bNW\b/g, replacement: "northwest" },
  { regex: /\bSE\b/g, replacement: "southeast" },
  { regex: /\bSW\b/g, replacement: "southwest" },
  { regex: /\bNM\b/g, replacement: "nautical miles" },
  { regex: /\bdeg\b/g, replacement: "degrees" },
  { regex: /\btstm\b/g, replacement: "thunderstorm" },
  { regex: /\bmm\b/g, replacement: "millimeters" },
  { regex: /\bcm\b/g, replacement: "centimeters" },
  { regex: /\bin\b/g, replacement: "inches" },
  { regex: /\bft\b/g, replacement: "feet" },
  { regex: /\bmi\b/g, replacement: "miles" },
  { regex: /\bhr\b/g, replacement: "hour" },
  { regex: /\bhourly\b/g, replacement: "per hour" },
  { regex: /\bkg\b/g, replacement: "kilograms" },
  { regex: /\bg\/kg\b/g, replacement: "grams per kilogram" },
  { regex: /\bmb\b/g, replacement: "millibars" },
  { regex: /\bhPa\b/g, replacement: "hectopascals" },
  { regex: /\bPa\b/g, replacement: "pascals" },
  { regex: /\bKPa\b/g, replacement: "kilopascals" },
  { regex: /\bC\/hr\b/g, replacement: "degrees Celsius per hour" },
  { regex: /\bF\/hr\b/g, replacement: "degrees Fahrenheit per hour" },
  { regex: /\bC\/min\b/g, replacement: "degrees Celsius per minute" },
  { regex: /\bF\/min\b/g, replacement: "degrees Fahrenheit per minute" },
  { regex: /\bC\b/g, replacement: "degrees Celsius" },
  { regex: /\bF\b/g, replacement: "degrees Fahrenheit" }
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CANCEL_SIGNATURES,
  MESSAGE_SIGNATURES,
  TAGS
});
