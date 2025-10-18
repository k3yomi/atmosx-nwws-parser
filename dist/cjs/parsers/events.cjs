var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
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

// src/parsers/events.ts
var events_exports2 = {};
__export(events_exports2, {
  EventParser: () => EventParser,
  default: () => events_default
});
module.exports = __toCommonJS(events_exports2);

// src/bootstrap.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var events = __toESM(require("events"));
var xmpp = __toESM(require("@xmpp/client"));
var shapefile = __toESM(require("shapefile"));
var xml2js = __toESM(require("xml2js"));
var cron = __toESM(require("node-cron"));
var import_better_sqlite3 = __toESM(require("better-sqlite3"));
var import_axios = __toESM(require("axios"));
var import_crypto = __toESM(require("crypto"));
var import_os = __toESM(require("os"));
var import_say = __toESM(require("say"));

// src/dictionaries/events.ts
var EVENTS = {
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
var ACTIONS = {
  "W": "Warning",
  "F": "Forecast",
  "A": "Watch",
  "O": "Outlook",
  "Y": "Advisory",
  "N": "Synopsis",
  "S": "Statement"
};
var STATUS = {
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
};
var TYPES = {
  "O": "Operational Product",
  "T": "Test Product",
  "E": "Experimental Product",
  "X": "Experimental Product (Non-Operational)"
};
var STATUS_CORRELATIONS = [
  { type: "Update", forward: "Updated", cancel: false, update: true, new: false },
  { type: "Cancel", forward: "Cancelled", cancel: true, update: false, new: false },
  { type: "Alert", forward: "Issued", cancel: false, update: false, new: true },
  { type: "Updated", forward: "Updated", cancel: false, update: true, new: false },
  { type: "Expired", forward: "Expired", cancel: true, update: false, new: false },
  { type: "Issued", forward: "Issued", cancel: false, update: false, new: true },
  { type: "Extended", forward: "Updated", cancel: false, update: true, new: false },
  { type: "Correction", forward: "Updated", cancel: false, update: true, new: false },
  { type: "Upgraded", forward: "Upgraded", cancel: false, update: true, new: false },
  { type: "Cancelled", forward: "Cancelled", cancel: true, update: false, new: false },
  { type: "Routine", forward: "Routine", cancel: false, update: true, new: false }
];

// src/dictionaries/offshore.ts
var OFFSHORE = {
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
};

// src/dictionaries/awips.ts
var AWIPS = {
  ABV: `rawinsonde-data-above-100-millibars`,
  ADA: `alarm-alert-administrative-message`,
  ADM: `alert-administrative-message`,
  ADR: `nws-administrative-message`,
  ADV: `space-environment-advisory`,
  AFD: `area-forecast-discussion`,
  AFM: `area-forecast-matrices`,
  AFP: `area-forecast-product`,
  AFW: `fire-weather-matrix`,
  AGF: `agricultural-forecast`,
  AGO: `agricultural-observations`,
  ALT: `space-environment-alert`,
  AQA: `air-quality-alert`,
  AQI: `air-quality-index-statement`,
  ASA: `air-stagnation-advisory`,
  AVA: `avalanche-watch`,
  AVG: `avalanche-weather-guidance`,
  AVW: `avalanche-warning`,
  AWO: `area-weather-outlook`,
  AWS: `area-weather-summary`,
  AWU: `area-weather-update`,
  AWW: `airport-weather-warning`,
  BLU: `blue-alert`,
  BOY: `buoy-report`,
  BRG: `coast-guard-observations`,
  BRT: `hourly-roundup-for-weather-radio`,
  CAE: `child-abduction-emergency`,
  CCF: `coded-city-forecast`,
  CDW: `civil-danger-warning`,
  CEM: `civil-emergency-message`,
  CF6: `monthly-daily-climate-data`,
  CFP: `convective-forecast-product`,
  CFW: `coastal-flood-warnings-watches-statements`,
  CGR: `coast-guard-surface-report`,
  CHG: `computer-hurricane-guidance`,
  CLA: `climatological-report-annual`,
  CLI: `climatological-report-daily`,
  CLM: `climatological-report-monthly`,
  CLQ: `climatological-report-quarterly`,
  CLS: `climatological-report-seasonal`,
  CLT: `climate-report`,
  CMM: `coded-climatological-monthly-means`,
  COD: `coded-analysis-and-forecasts`,
  CPF: `great-lakes-port-forecast`,
  CUR: `space-environment-products-routine`,
  CWA: `center-weather-advisory`,
  CWF: `coastal-waters-forecast`,
  CWS: `center-weather-statement`,
  DAY: `space-environment-product-daily`,
  DDO: `daily-dispersion-outlook`,
  DGT: `drought-information-statement`,
  DMO: `practice-demo-warning`,
  DSA: `unnumbered-depression-advisory`,
  DSM: `asos-daily-summary`,
  DSW: `dust-storm-warning`,
  EFP: `extended-forecast-3-to-5-day`,
  EOL: `six-to-ten-day-weather-outlook-local`,
  EQI: `tsunami-bulletin`,
  EQR: `earthquake-report`,
  EQW: `earthquake-warning`,
  ESF: `flood-potential-outlook`,
  ESG: `extended-streamflow-guidance`,
  ESP: `extended-streamflow-prediction`,
  ESS: `water-supply-outlook`,
  EVI: `evacuation-immediate`,
  EWW: `extreme-wind-warning`,
  FA0: `aviation-area-forecast-pacific`,
  FA1: `aviation-area-forecast-northeast`,
  FA2: `aviation-area-forecast-southeast`,
  FA3: `aviation-area-forecast-north-central`,
  FA4: `aviation-area-forecast-south-central`,
  FA5: `aviation-area-forecast-rocky-mountains`,
  FA6: `aviation-area-forecast-west-coast`,
  FA7: `aviation-area-forecast-juneau-ak`,
  FA8: `aviation-area-forecast-anchorage-ak`,
  FA9: `aviation-area-forecast-fairbanks-ak`,
  FD0: `winds-aloft-forecast-24hr-high-altitude`,
  FD1: `winds-aloft-forecast-6hr`,
  FD2: `winds-aloft-forecast-12hr`,
  FD3: `winds-aloft-forecast-24hr`,
  FD4: `winds-aloft-forecast`,
  FD5: `winds-aloft-forecast`,
  FD6: `winds-aloft-forecast`,
  FD7: `winds-aloft-forecast`,
  FD8: `winds-aloft-forecast-6hr-high-altitude`,
  FD9: `winds-aloft-forecast-12hr-high-altitude`,
  FDI: `fire-danger-indices`,
  FFA: `flash-flood-watch`,
  FFG: `flash-flood-guidance`,
  FFH: `headwater-guidance`,
  FFS: `flash-flood-statement`,
  FFW: `flash-flood-warning`,
  FLN: `national-flood-summary`,
  FLS: `flood-statement`,
  FLW: `flood-warning`,
  FOF: `upper-wind-fallout-forecast`,
  FRW: `fire-warning`,
  FSH: `marine-fisheries-service-message`,
  FTM: `radar-outage-notification`,
  FTP: `temp-pop-guidance`,
  FWA: `fire-weather-administrative-message`,
  FWD: `fire-weather-outlook-discussion`,
  FWF: `fire-weather-forecast`,
  FWL: `land-management-forecast`,
  FWM: `miscellaneous-fire-weather-product`,
  FWN: `fire-weather-notification`,
  FWO: `fire-weather-observation`,
  FWS: `fire-weather-spot-forecast`,
  FZL: `freezing-level-data`,
  GLF: `great-lakes-forecast`,
  GLS: `great-lakes-storm-summary`,
  GRE: `green`,
  HD1: `rfc-qpf-data-product`,
  HD2: `rfc-qpf-data-product`,
  HD3: `rfc-qpf-data-product`,
  HD4: `rfc-qpf-data-product`,
  HD7: `rfc-qpf-data-product`,
  HD8: `rfc-qpf-data-product`,
  HD9: `rfc-qpf-data-product`,
  HLS: `hurricane-local-statement`,
  HMD: `hydrometeorological-discussion`,
  HML: `ahps-xml-product`,
  HMW: `hazardous-materials-warning`,
  HP1: `rfc-qpf-verification-product`,
  HP2: `rfc-qpf-verification-product`,
  HP3: `rfc-qpf-verification-product`,
  HP4: `rfc-qpf-verification-product`,
  HP5: `rfc-qpf-verification-product`,
  HP6: `rfc-qpf-verification-product`,
  HP7: `rfc-qpf-verification-product`,
  HP8: `rfc-qpf-verification-product`,
  HRR: `weather-roundup`,
  HSF: `high-seas-forecast`,
  HWO: `hazardous-weather-outlook`,
  HWR: `hourly-weather-roundup`,
  HYD: `daily-hydrometeorological-products`,
  HYM: `monthly-hydrometeorological-product`,
  ICE: `ice-forecast`,
  IDM: `ice-drift-vectors`,
  INI: `administrative-message`,
  IOB: `ice-observation`,
  KPA: `keep-alive-message`,
  LAE: `local-area-emergency`,
  LCD: `preliminary-local-climatological-data`,
  LCO: `local-cooperative-observation`,
  LEW: `law-enforcement-warning`,
  LFP: `local-forecast`,
  LKE: `lake-stages`,
  LLS: `low-level-sounding`,
  LOW: `low-temperatures`,
  LSR: `local-storm-report`,
  LTG: `lightning-data`,
  MAN: `rawinsonde-mandatory-levels`,
  MAP: `mean-areal-precipitation`,
  MAW: `amended-marine-forecast`,
  MFM: `marine-forecast-matrix`,
  MIM: `marine-interpretation-message`,
  MIS: `miscellaneous-local-product`,
  MOB: `marine-observations`,
  MON: `space-environment-product-monthly`,
  MRP: `marine-product-techniques-development`,
  MSM: `asos-monthly-summary-message`,
  MTR: `metar-observation`,
  MTT: `metar-test-message`,
  MVF: `marine-verification-coded-message`,
  MWS: `marine-weather-statement`,
  MWW: `marine-weather-message`,
  NOU: `weather-reconnaissance-flights`,
  NOW: `short-term-forecast`,
  NOX: `data-management-message`,
  NPW: `non-precipitation-warning`,
  NSH: `nearshore-marine-forecast`,
  NUW: `nuclear-power-plant-warning`,
  NWR: `noaa-weather-radio-forecast`,
  OAV: `other-aviation-products`,
  OBS: `observations`,
  OFA: `offshore-aviation-forecast`,
  OFF: `offshore-forecast`,
  OMR: `other-marine-products`,
  OPU: `other-public-products`,
  OSO: `other-surface-observations`,
  OSW: `ocean-surface-winds`,
  OUA: `other-upper-air-data`,
  OZF: `zone-forecast`,
  PFM: `point-forecast-matrices`,
  PFW: `fire-weather-point-forecast-matrices`,
  PLS: `plain-language-ship-report`,
  PMD: `prognostic-meteorological-discussion`,
  PNS: `public-information-statement`,
  POE: `probability-of-exceedance`,
  PRB: `heat-index-forecast-tables`,
  PRC: `pilot-report-collective`,
  PRE: `preliminary-forecasts`,
  PSH: `post-storm-hurricane-report`,
  PTS: `probabilistic-outlook-points`,
  PWO: `public-severe-weather-outlook`,
  PWS: `tropical-cyclone-probabilities`,
  QPF: `quantitative-precipitation-forecast`,
  QPS: `quantitative-precipitation-statement`,
  RDF: `revised-digital-forecast`,
  REC: `recreational-report`,
  RER: `record-report`,
  RET: `eas-activation-request`,
  RFD: `rangeland-fire-danger-forecast`,
  RFI: `rfi-observation`,
  RFR: `route-forecast`,
  RFW: `red-flag-warning`,
  RHW: `radiological-hazard-warning`,
  RMT: `required-monthly-test`,
  RNS: `rain-information-statement`,
  RR1: `hydro-met-data-report-part-1`,
  RR2: `hydro-met-data-report-part-2`,
  RR3: `hydro-met-data-report-part-3`,
  RR4: `hydro-met-data-report-part-4`,
  RR5: `hydro-met-data-report-part-5`,
  RR6: `hydro-met-data-report-part-6`,
  RR7: `hydro-met-data-report-part-7`,
  RR8: `hydro-met-data-report-part-8`,
  RR9: `hydro-met-data-report-part-9`,
  RRA: `automated-hydrologic-observation-report`,
  RRM: `miscellaneous-hydrologic-data`,
  RRS: `hads-data`,
  RRY: `asos-hourly-test-message`,
  RSD: `daily-snotel-data`,
  RSM: `monthly-snotel-data`,
  RTP: `regional-temp-precip-table`,
  RVA: `river-summary`,
  RVD: `daily-river-forecast`,
  RVF: `river-forecast`,
  RVI: `river-ice-statement`,
  RVM: `miscellaneous-river-product`,
  RVR: `river-recreation-statement`,
  RVS: `river-statement`,
  RWR: `regional-weather-roundup`,
  RWS: `regional-weather-summary`,
  RWT: `required-weekly-test`,
  SAB: `special-avalanche-bulletin`,
  SAF: `agricultural-weather-forecast`,
  SAG: `snow-avalanche-guidance`,
  SAT: `apt-prediction`,
  SAW: `preliminary-notice-of-watch`,
  SCC: `storm-summary`,
  SCD: `supplementary-climatological-data`,
  SCN: `soil-climate-analysis-network`,
  SCP: `satellite-cloud-product`,
  SCS: `selected-cities-summary`,
  SDO: `supplementary-data-observation`,
  SDS: `special-dispersion-statement`,
  SEL: `severe-local-storm-watch`,
  SEV: `spc-watch-point-information`,
  SFP: `state-forecast`,
  SFT: `tabular-state-forecast`,
  SGL: `rawinsonde-significant-levels`,
  SHP: `surface-ship-report`,
  SIG: `international-sigmet`,
  SIM: `satellite-interpretation-message`,
  SLS: `severe-local-storm-outline`,
  SMF: `smoke-management-weather-forecast`,
  SMW: `special-marine-warning`,
  SOO: `science-operations-officer-product`,
  SPE: `satellite-precipitation-estimates`,
  SPF: `storm-strike-probability-bulletin`,
  SPS: `special-weather-statement`,
  SPW: `shelter-in-place-warning`,
  SQW: `snow-squall-warning`,
  SRD: `surf-discussion`,
  SRF: `surf-forecast`,
  SRG: `soaring-guidance`,
  SSM: `synoptic-surface-observation`,
  STA: `weather-statistical-summary`,
  STD: `satellite-tropical-disturbance-summary`,
  STO: `road-condition-report`,
  STP: `state-temp-precip-table`,
  STQ: `spot-forecast-request`,
  SUM: `space-weather-message`,
  SVR: `severe-thunderstorm-warning`,
  SVS: `severe-weather-statement`,
  SWO: `severe-storm-outlook`,
  SWS: `state-weather-summary`,
  SYN: `regional-weather-synopsis`,
  TAF: `terminal-aerodrome-forecast`,
  TAP: `terminal-alerting-products`,
  TAV: `travelers-forecast-table`,
  TCA: `tropical-cyclone-advisory`,
  TCD: `tropical-cyclone-discussion`,
  TCE: `tropical-cyclone-position-estimate`,
  TCM: `tropical-cyclone-marine-aviation-advisory`,
  TCP: `public-tropical-cyclone-advisory`,
  TCS: `satellite-tropical-cyclone-summary`,
  TCU: `tropical-cyclone-update`,
  TCV: `tropical-cyclone-break-points`,
  TIB: `tsunami-bulletin`,
  TID: `tide-report`,
  TMA: `tsunami-tide-seismic-acknowledgement`,
  TOE: `telephone-outage-emergency`,
  TOR: `tornado-warning`,
  TPT: `temperature-precipitation-table`,
  TSU: `tsunami-watch-warning`,
  TUV: `ultraviolet-index`,
  TVL: `travelers-forecast`,
  TWB: `transcribed-weather-broadcast`,
  TWD: `tropical-weather-discussion`,
  TWO: `tropical-weather-outlook`,
  TWS: `tropical-weather-summary`,
  URN: `aircraft-reconnaissance`,
  UVI: `ultraviolet-index`,
  VAA: `volcanic-activity-advisory`,
  VER: `forecast-verification-statistics`,
  VFT: `taf-verification-product`,
  VOW: `volcano-warning`,
  WA0: `airmet-pacific`,
  WA1: `airmet-northeast`,
  WA2: `airmet-southeast`,
  WA3: `airmet-north-central`,
  WA4: `airmet-south-central`,
  WA5: `airmet-rocky-mountains`,
  WA6: `airmet-west-coast`,
  WA7: `airmet-juneau-ak`,
  WA8: `airmet-anchorage-ak`,
  WA9: `airmet-fairbanks-ak`,
  WAR: `space-environment-warning`,
  WAT: `space-environment-watch`,
  WCN: `weather-watch-clearance-notification`,
  WCR: `weekly-weather-and-crop-report`,
  WDA: `weekly-data-for-agriculture`,
  WDU: `warning-decision-update`,
  WEK: `space-environment-product-weekly`,
  WOU: `watch-outline-update`,
  WS1: `sigmet-northeast`,
  WS2: `sigmet-southeast`,
  WS3: `sigmet-north-central`,
  WS4: `sigmet-south-central`,
  WS5: `sigmet-rocky-mountains`,
  WS6: `sigmet-west-coast`,
  WST: `tropical-cyclone-sigmet`,
  WSV: `volcanic-activity-sigmet`,
  WSW: `winter-weather-warning`,
  WWA: `watch-status-report`,
  WWP: `watch-probabilities`,
  ZFP: `zone-forecast-product`
};

// src/dictionaries/signatures.ts
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

// src/dictionaries/icao.ts
var ICAOs = {
  "KLCH": "Lake Charles, LA",
  "TSTL": "St. Louis, MO",
  "PABC": "Bethel, AK",
  "TCMH": "Columbus, OH",
  "KEPZ": "El Paso, TX",
  "KCYS": "Cheyenne, WY",
  "KJKL": "Jackson, KY",
  "KPAH": "Paducah, KY",
  "KEMX": "Tucson, AZ",
  "KMHX": "Morehead City, NC",
  "PAPD": "Fairbanks, AK",
  "KDLH": "Duluth, MN",
  "TADW": "Andrews Air Force Base, MD",
  "KOKX": "Brookhaven, NY",
  "KLZK": "Little Rock, AR",
  "KHGX": "Houston, TX",
  "TMSY": "New Orleans, LA",
  "KDGX": "Jackson/Brandon, MS",
  "KCTP": "Caribou, ME",
  "KAMA": "Amarillo, TX",
  "PGUA": "Andersen AFB, GU",
  "KAPX": "Gaylord, MI",
  "PAHG": "Kenai, AK",
  "KLWX": "Sterling, VA",
  "HWPA2": "Homer, AK",
  "KGRK": "Fort Hood, TX",
  "KAKQ": "Wakefield, VA",
  "ROCO2": "Norman, OK",
  "KCLX": "Charleston, SC",
  "TPHX": "Phoenix, AZ",
  "KNKX": "San Diego, CA",
  "TDEN": "Denver, CO",
  "TLAS": "Las Vegas, NV",
  "KBUF": "Buffalo, NY",
  "KTLX": "Norman, OK",
  "KILX": "Lincoln, IL",
  "KHDC": "Hammond, LA",
  "KVWX": "Evansville, IN",
  "TCLT": "Charlotte, NC",
  "TEWR": "Newark, NJ",
  "KFSD": "Sioux Falls, SD",
  "KEAX": "Pleasant Hill, MO",
  "KICX": "Cedar City, UT",
  "KHTX": "Huntsville, AL",
  "PACG": "Sitka, AK",
  "KSOX": "Santa Ana Mountains, CA",
  "TPBI": "West Palm Beach, FL",
  "TSLC": "Salt Lake City, UT",
  "KGLD": "Goodland, KS",
  "TRDU": "Raleigh-Durham, NC",
  "KATX": "Seattle, WA",
  "TICH": "Wichita, KS",
  "TSDF": "Louisville, KY",
  "TBOS": "Boston, MA",
  "TDCA": "Washington, DC",
  "KUEX": "Grand Island, NE",
  "TLKA2": "Talkeetna, AK",
  "KBGM": "Binghamton, NY",
  "TLVE": "Cleveland, OH",
  "KCAE": "Columbia, SC",
  "KDVN": "Quad Cities, IA",
  "KABR": "Aberdeen, SD",
  "KBYX": "Key West, FL",
  "KMPX": "Minneapolis, MN",
  "KCRP": "Corpus Christi, TX",
  "KCBW": "Caribou, ME",
  "KMRX": "Knoxville, TN",
  "KSHV": "Shreveport, LA",
  "KIWA": "Phoenix, AZ",
  "KRGX": "Reno, NV",
  "PHKM": "Kamuela, HI",
  "KABX": "Albuquerque, NM",
  "KBMX": "Birmingham, AL",
  "TMDW": "Chicago Midway, IL",
  "KVAX": "Moody AFB, GA",
  "KHDX": "Holloman AFB, NM",
  "KBRO": "Brownsville, TX",
  "KTWX": "Topeka, KS",
  "KRTX": "Portland, OR",
  "KCXX": "Burlington, VT",
  "KFCX": "Roanoke, VA",
  "KFFC": "Atlanta, GA",
  "KBOX": "Boston, MA",
  "KTLH": "Tallahassee, FL",
  "KPUX": "Pueblo, CO",
  "KFDR": "Altus AFB, OK",
  "KGJX": "Grand Junction, CO",
  "KDTX": "Detroit, MI",
  "PHWA": "Waimea, HI",
  "KMQT": "Marquette, MI",
  "KSJT": "San Angelo, TX",
  "KUDX": "Rapid City, SD",
  "TIAH": "Houston, TX",
  "KSRX": "Fort Smith, AR",
  "TJFK": "New York City, NY",
  "KDDC": "Dodge City, KS",
  "PAKC": "King Salmon, AK",
  "PAIH": "Middleton Island, AK",
  "RODN": "Kadena AB, JA",
  "TBWI": "Baltimore/Washington, MD",
  "KIWX": "Northern Indiana, IN",
  "KFDX": "Cannon AFB, NM",
  "TMIA": "Miami, FL",
  "KICT": "Wichita, KS",
  "TMKE": "Milwaukee, WI",
  "TFLL": "Fort Lauderdale, FL",
  "KARX": "La Crosse, WI",
  "KLRX": "Elko, NV",
  "KDAX": "Sacramento, CA",
  "KGRB": "Green Bay, WI",
  "KLGX": "Langley Hill, WA",
  "KFTG": "Denver, CO",
  "KMKX": "Milwaukee, WI",
  "TTUL": "Tulsa, OK",
  "TDFW": "Dallas/Fort Worth, TX",
  "TTPA": "Tampa Bay, FL",
  "TDAL": "Dallas Love Field, TX",
  "KDFX": "Laughlin AFB, TX",
  "KSFX": "Pocatello, ID",
  "KMTX": "Salt Lake City, UT",
  "PAEC": "Nome, AK",
  "RKSG": "Camp Humphreys, KR",
  "KOAX": "Omaha, NE",
  "PHMO": "Molokai, HI",
  "TDTW": "Detroit, MI",
  "THOU": "Houston, TX",
  "AWPA2": "Anchorage, AK",
  "KTYX": "Fort Drum, NY",
  "KCCX": "State College, PA",
  "TMSP": "Minneapolis, MN",
  "KMVX": "Grand Forks, ND",
  "KBIS": "Bismarck, ND",
  "KBBX": "Beale AFB, CA",
  "KVBX": "Vandenberg AFB, CA",
  "KPOE": "Fort Polk, LA",
  "KMOB": "Mobile, AL",
  "KJGX": "Robins AFB, GA",
  "KMUX": "San Francisco, CA",
  "TMCI": "Kansas City, MO",
  "KLSX": "St. Louis, MO",
  "KMAX": "Medford, OR",
  "KRAX": "Raleigh/Durham, NC",
  "KINX": "Tulsa, OK",
  "RKJK": "Kunsan AB, KR",
  "KSGF": "Springfield, MO",
  "TDAY": "Dayton, OH",
  "KDOX": "Dover AFB, DE",
  "KGGW": "Glasgow, MT",
  "KAMX": "Miami, FL",
  "KENX": "Albany, NY",
  "KTFX": "Great Falls, MT",
  "KPBZ": "Pittsburgh, PA",
  "KMAF": "Midland/Odessa, TX",
  "KPDT": "Pendleton, OR",
  "KLNX": "North Platte, NE",
  "KEOX": "Fort Rucker, AL",
  "KGSP": "Greer, SC",
  "KHPX": "Fort Campbell, KY",
  "KGRR": "Grand Rapids, MI",
  "KLOT": "Chicago, IL",
  "TPIT": "Pittsburgh, PA",
  "KEYX": "Edwards AFB, CA",
  "TIAD": "Dulles, VA",
  "KFWS": "Dallas/Fort Worth, TX",
  "KMLB": "Melbourne, FL",
  "KMBX": "Minot AFB, ND",
  "KDMX": "Des Moines, IA",
  "KEVX": "Eglin AFB, FL",
  "TBNA": "Nashville, TN",
  "KDYX": "Dyess AFB, TX",
  "TOKC": "Oklahoma City, OK",
  "PHKI": "South Kauai, HI",
  "TMCO": "Orlando, FL",
  "KDIX": "Philadelphia, PA",
  "TORD": "Chicago, IL",
  "KYUX": "Yuma, AZ",
  "KVNX": "Vance AFB, OK",
  "TJUA": "San Juan, PR",
  "TATL": "Atlanta, GA",
  "KVTX": "Los Angeles, CA",
  "KIND": "Indianapolis, IN",
  "KCBX": "Boise, ID",
  "KGYX": "Portland, ME",
  "KMXX": "Maxwell AFB, AL",
  "TSJU": "San Juan, PR",
  "KHNX": "San Joaquin Valley, CA",
  "KLVX": "Louisville, KY",
  "KMSX": "Missoula, MT",
  "KJAX": "Jacksonville, FL",
  "KNQA": "Memphis, TN",
  "KRIW": "Riverton/Lander, WY",
  "TCVG": "Covington, KY",
  "KBLX": "Billings, MT",
  "TPHL": "Philadelphia, PA",
  "KRLX": "Charleston, WV",
  "TMEM": "Memphis, TN",
  "KCLE": "Cleveland, OH",
  "KBHX": "Eureka, CA",
  "KLBB": "Lubbock, TX",
  "KOTX": "Spokane, WA",
  "KEWX": "Austin/San Antonio, TX",
  "KGWX": "Columbus AFB, MS",
  "KESX": "Las Vegas, NV",
  "KTBW": "Tampa, FL",
  "KOHX": "Nashville, TN",
  "KLTX": "Wilmington, NC",
  "KFSX": "Flagstaff, AZ",
  "TIDS": "Indianapolis, IN",
  "KILN": "Cincinnati, OH",
  "PAFG": "Fairbanks, AK",
  "KPQR": "Portland, OR",
  "KILM": "Wilmington, NC",
  "KEKA": "Eureka, CA",
  "KCHS": "Charleston, SC",
  "KPHI": "Philadelphia/Mt. Holly, NJ",
  "KUNR": "Rapid City, SD",
  "KMFL": "Miami, FL",
  "TJSJ": "San Juan, PR",
  "KFGF": "Grand Forks, ND",
  "KSEW": "Seattle, WA",
  "PAFC": "Anchorage, AK",
  "KLMK": "Louisville, KY",
  "PHFO": "Honolulu, HI",
  "KLIX": "New Orleans/Baton Rouge, LA",
  "KBOI": "Boise, ID",
  "KPIH": "Pocatello, ID",
  "KMTR": "San Francisco/Monterey, CA",
  "KGJT": "Grand Junction, CO",
  "PAAQ": "Anchorage, AK",
  "KABQ": "Albuquerque, NM",
  "KTAE": "Tallahassee, FL",
  "KCAR": "Caribou, ME",
  "KMFR": "Medford, OR",
  "PGUM": "Guam, GU",
  "PAJK": "Juneau, AK"
};

// src/bootstrap.ts
var packages = {
  fs,
  path,
  events,
  xmpp,
  shapefile,
  xml2js,
  sqlite3: import_better_sqlite3.default,
  cron,
  axios: import_axios.default,
  crypto: import_crypto.default,
  os: import_os.default,
  say: import_say.default
};
var cache = {
  isReady: true,
  sigHalt: false,
  isConnected: false,
  attemptingReconnect: false,
  totalReconnects: 0,
  lastStanza: null,
  session: null,
  lastConnect: null,
  db: null,
  events: new events.EventEmitter(),
  isProcessingAudioQueue: false,
  audioQueue: []
};
var settings = {
  database: path.join(process.cwd(), "shapefiles.db"),
  isNWWS: true,
  catchUnhandledExceptions: false,
  NoaaWeatherWireService: {
    clientReconnections: {
      canReconnect: true,
      currentInterval: 60
    },
    clientCredentials: {
      username: null,
      password: null,
      nickname: "AtmosphericX Standalone Parser"
    },
    cache: {
      read: false,
      maxSizeMB: 5,
      maxHistory: 5e3,
      directory: null
    },
    alertPreferences: {
      isCapOnly: false,
      isShapefileUGC: false
    }
  },
  NationalWeatherService: {
    checkInterval: 15,
    endpoint: "https://api.weather.gov/alerts/active"
  },
  global: {
    useParentEvents: true,
    betterEventParsing: true,
    alertFiltering: {
      filteredEvents: [],
      filteredICOAs: [],
      ignoredICOAs: [`KWNS`],
      ignoredEvents: [`Xx`, `Test Message`],
      ugcFilter: [],
      stateFilter: [],
      checkExpired: true
    },
    easSettings: {
      easAlerts: [],
      easDirectory: null,
      easIntroWav: null
    }
  }
};
var definitions = {
  events: EVENTS,
  actions: ACTIONS,
  status: STATUS,
  productTypes: TYPES,
  correlations: STATUS_CORRELATIONS,
  offshore: OFFSHORE,
  awips: AWIPS,
  cancelSignatures: CANCEL_SIGNATURES,
  messageSignatures: MESSAGE_SIGNATURES,
  tags: TAGS,
  ICAO: ICAOs,
  enhancedEvents: [
    { "Tornado Warning": {
      "Tornado Emergency": { description: "tornado emergency", condition: (tornadoThreatTag) => tornadoThreatTag === "OBSERVED" },
      "PDS Tornado Warning": { description: "particularly dangerous situation", condition: (damageThreatTag) => damageThreatTag === "CONSIDERABLE" },
      "Confirmed Tornado Warning": { condition: (tornadoThreatTag) => tornadoThreatTag === "OBSERVED" },
      "Radar Indicated Tornado Warning": { condition: (tornadoThreatTag) => tornadoThreatTag !== "OBSERVED" }
    } },
    { "Tornado Watch": {
      "PDS Tornado Watch": { description: "particularly dangerous situation" }
    } },
    { "Flash Flood Warning": {
      "Flash Flood Emergency": { description: "flash flood emergency" },
      "Considerable Flash Flood Warning": { condition: (damageThreatTag) => damageThreatTag === "CONSIDERABLE" }
    } },
    { "Severe Thunderstorm Warning": {
      "EDS Severe Thunderstorm Warning": { description: "extremely dangerous situation" },
      "Destructive Severe Thunderstorm Warning": { condition: (damageThreatTag) => damageThreatTag === "DESTRUCTIVE" },
      "Considerable Severe Thunderstorm Warning": { condition: (damageThreatTag) => damageThreatTag === "CONSIDERABLE" }
    } }
  ],
  expressions: {
    vtec: `[OTEX].(NEW|CON|EXT|EXA|EXB|UPG|CAN|EXP|COR|ROU).[A-Z]{4}.[A-Z]{2}.[WAYSFON].[0-9]{4}.[0-9]{6}T[0-9]{4}Z-[0-9]{6}T[0-9]{4}Z`,
    wmo: `[A-Z0-9]{6}\\s[A-Z]{4}\\s\\d{6}`,
    ugc1: `(\\w{2}[CZ](\\d{3}((-|>)\\s?(

)?))+)`,
    ugc2: `(\\d{6}(-|>)\\s?(

)?)`,
    ugc3: `(\\d{6})(?=-|$)`,
    dateline: `/d{3,4}s*(AM|PM)?s*[A-Z]{2,4}s+[A-Z]{3,}s+[A-Z]{3,}s+d{1,2}s+d{4}`,
    wmoID: `[A-Z0-9]{2}([A-Z]{3})`
  },
  shapefiles: [
    { id: `C`, file: `USCounties` },
    { id: `Z`, file: `ForecastZones` },
    { id: `Z`, file: `FireZones` },
    { id: `Z`, file: `OffShoreZones` },
    { id: `Z`, file: `FireCounties` },
    { id: `Z`, file: `Marine` }
  ],
  messages: {
    shapefile_creation: `[NOTICE] DO NOT CLOSE THIS PROJECT UNTIL THE SHAPEFILES ARE DONE COMPLETING!
	 THIS COULD TAKE A WHILE DEPENDING ON THE SPEED OF YOUR STORAGE!!
	 IF YOU CLOSE YOUR PROJECT, THE SHAPEFILES WILL NOT BE CREATED AND YOU WILL NEED TO DELETE ${settings.database} AND RESTART TO CREATE THEM AGAIN!`,
    shapefile_creation_finished: `[NOTICE] SHAPEFILES HAVE BEEN SUCCESSFULLY CREATED AND THE DATABASE IS READY FOR USE!`,
    not_ready: "[ERROR] You can NOT create another instance without shutting down the current one first, please make sure to call the stop() method first!",
    invalid_nickname: "[WARNING] The nickname you provided is invalid, please provide a valid nickname to continue.",
    eas_no_directory: "[WARNING] You have not set a directory for EAS audio files to be saved to, please set the 'easDirectory' setting in the global settings to enable EAS audio generation."
  }
};

// src/parsers/text.ts
var TextParser = class {
  /**
   * textProductToString extracts a specific value from a text-based weather product message based on a given key and optional removal strings.
   *
   * @public
   * @static
   * @param {string} message 
   * @param {string} value 
   * @param {string[]} [removal=[]] 
   * @returns {(string | null)} 
   */
  static textProductToString(message, value, removal = []) {
    const lines = message.split("\n");
    for (const line of lines) {
      if (line.includes(value)) {
        let result = line.slice(line.indexOf(value) + value.length).trim();
        for (const str of removal) {
          result = result.split(str).join("");
        }
        result = result.replace(value, "").replace("<", "").trim();
        return result || null;
      }
    }
    return null;
  }
  /**
   * textProductToPolygon extracts geographical coordinates from a text-based weather product message and returns them as an array of [longitude, latitude] pairs.
   *
   * @public
   * @static
   * @param {string} message 
   * @returns {[number, number][]} 
   */
  static textProductToPolygon(message) {
    const coordinates = [];
    const latLonMatch = message.match(/LAT\.{3}LON\s+([\d\s]+)/i);
    if (!latLonMatch || !latLonMatch[1]) return coordinates;
    const coordStrings = latLonMatch[1].replace(/\n/g, " ").trim().split(/\s+/);
    for (let i = 0; i < coordStrings.length - 1; i += 2) {
      const lat = parseFloat(coordStrings[i]) / 100;
      const lon = -parseFloat(coordStrings[i + 1]) / 100;
      if (!isNaN(lat) && !isNaN(lon)) {
        coordinates.push([lon, lat]);
      }
    }
    if (coordinates.length > 2) {
      coordinates.push(coordinates[0]);
    }
    return coordinates;
  }
  /**
   * textProductToDescription extracts the main description from a text-based weather product message.
   *
   * @public
   * @static
   * @param {string} message 
   * @param {string} [handle=null] 
   * @returns {string} 
   */
  static textProductToDescription(message, handle = null) {
    const original = message;
    const dateRegex = /\d{3,4}\s*(AM|PM)?\s*[A-Z]{2,4}\s+[A-Z]{3,}\s+[A-Z]{3,}\s+\d{1,2}\s+\d{4}/gim;
    const discoveredDates = Array.from(message.matchAll(dateRegex));
    if (discoveredDates.length) {
      const lastMatch = discoveredDates[discoveredDates.length - 1][0];
      const startIdx = message.lastIndexOf(lastMatch);
      if (startIdx !== -1) {
        const endIdx = message.indexOf("&&", startIdx);
        message = message.substring(startIdx + lastMatch.length, endIdx !== -1 ? endIdx : void 0).trimStart();
        if (message.startsWith("/")) message = message.slice(1).trimStart();
        if (handle && message.includes(handle)) {
          const handleIdx = message.indexOf(handle);
          message = message.substring(handleIdx + handle.length).trimStart();
          if (message.startsWith("/")) message = message.slice(1).trimStart();
        }
      }
    } else if (handle) {
      const handleIdx = message.indexOf(handle);
      if (handleIdx !== -1) {
        let afterHandle = message.substring(handleIdx + handle.length).trimStart();
        if (afterHandle.startsWith("/")) afterHandle = afterHandle.slice(1).trimStart();
        const latEnd = afterHandle.indexOf("&&");
        message = latEnd !== -1 ? afterHandle.substring(0, latEnd).trim() : afterHandle.trim();
      }
    }
    return message.replace(/\s+/g, " ").trim().startsWith("ISSUED TIME...") ? original : message.trim();
  }
  /**
   * awipTextToEvent converts an AWIPS ID prefix from a text-based weather product message to its corresponding event type and prefix.
   *
   * @public
   * @static
   * @param {string} message 
   * @returns {{ type: any; prefix: any; }} 
   */
  static awipTextToEvent(message) {
    for (const [prefix, type] of Object.entries(definitions.awips)) {
      if (message.startsWith(prefix)) {
        return { type, prefix };
      }
    }
    return { type: `XX`, prefix: `XX` };
  }
  /**
   * getXmlValues recursively searches a parsed XML object for specified keys and extracts their values.
   *
   * @public
   * @static
   * @param {*} parsed 
   * @param {string[]} valuesToExtract 
   * @returns {Record<string, any>} 
   */
  static getXmlValues(parsed, valuesToExtract) {
    const extracted = {};
    const findValueByKey = (obj, searchKey) => {
      const results = [];
      if (obj === null || typeof obj !== "object") {
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
          if (item.valueName && item.valueName.toLowerCase() === searchKeyLower && item.value !== void 0) {
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
      extracted[key] = uniqueValues.length === 0 ? null : uniqueValues.length === 1 ? uniqueValues[0] : uniqueValues;
    }
    return extracted;
  }
};
var text_default = TextParser;

// src/parsers/ugc.ts
var UGCParser = class {
  /**
   * ugcExtractor extracts and parses UGC codes from a given message string.
   *
   * @public
   * @static
   * @async
   * @param {string} message 
   * @returns {unknown} 
   */
  static ugcExtractor(message) {
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
   * getHeader extracts the UGC header from a UGC message string.
   *
   * @public
   * @static
   * @param {string} message 
   * @returns {*} 
   */
  static getHeader(message) {
    const start = message.search(new RegExp(definitions.expressions.ugc1, "gimu"));
    const end = message.substring(start).search(new RegExp(definitions.expressions.ugc2, "gimu"));
    const full = message.substring(start, start + end).replace(/\s+/g, "").slice(0, -1);
    return full;
  }
  /**
   * getExpiry extracts the expiry date and time from a UGC message and returns it as a Date object.
   *
   * @public
   * @static
   * @param {string} message 
   * @returns {*} 
   */
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
   * getLocations retrieves unique location names for the provided UGC zone codes from the database.
   *
   * @public
   * @static
   * @async
   * @param {String[]} zones 
   * @returns {unknown} 
   */
  static getLocations(zones) {
    return __async(this, null, function* () {
      const locations = [];
      for (let i = 0; i < zones.length; i++) {
        const id = zones[i].trim();
        const located = yield cache.db.prepare(`SELECT location FROM shapefiles WHERE id = ?`).get(id);
        located != void 0 ? locations.push(located.location) : locations.push(id);
      }
      return Array.from(new Set(locations)).sort();
    });
  }
  /**
   * getCoordinates retrieves geographical coordinates for the provided UGC zone codes from the database.
   *
   * @public
   * @static
   * @param {String[]} zones 
   * @returns {{}} 
   */
  static getCoordinates(zones) {
    let coordinates = [];
    for (let i = 0; i < zones.length; i++) {
      const id = zones[i].trim();
      let located = cache.db.prepare(`SELECT geometry FROM shapefiles WHERE id = ?`).get(id);
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
   * getZones parses a UGC header string and returns an array of individual UGC zone codes.
   *
   * @public
   * @static
   * @param {string} header 
   * @returns {*} 
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
var ugc_default = UGCParser;

// src/parsers/vtec.ts
var VtecParser = class {
  /**
   * vtecExtractor extracts and parses VTEC codes from a given message string.
   *
   * @public
   * @static
   * @async
   * @param {string} message 
   * @returns {unknown} 
   */
  static vtecExtractor(message) {
    return __async(this, null, function* () {
      const vtecs = [];
      const matches = message.match(new RegExp(definitions.expressions.vtec, "g"));
      if (!matches) return null;
      for (let i = 0; i < matches.length; i++) {
        const vtec = matches[i];
        const parts = vtec.split(`.`);
        const dates = parts[6].split(`-`);
        vtecs.push({
          raw: vtec,
          type: definitions.productTypes[parts[0]],
          tracking: `${parts[2]}-${parts[3]}-${parts[4]}-${parts[5]}`,
          event: `${definitions.events[parts[3]]} ${definitions.actions[parts[4]]}`,
          status: definitions.status[parts[1]],
          wmo: message.match(new RegExp(definitions.expressions.wmo, "gimu")),
          expires: this.parseExpiryDate(dates)
        });
      }
      return vtecs;
    });
  }
  /**
   * parseExpiryDate converts VTEC expiry date format to a standard ISO 8601 format with timezone adjustment.
   *
   * @private
   * @static
   * @param {String[]} args 
   * @returns {string} 
   */
  static parseExpiryDate(args) {
    if (args[1] == `000000T0000Z`) return `Invalid Date Format`;
    const expires = `${(/* @__PURE__ */ new Date()).getFullYear().toString().substring(0, 2)}${args[1].substring(0, 2)}-${args[1].substring(2, 4)}-${args[1].substring(4, 6)}T${args[1].substring(7, 9)}:${args[1].substring(9, 11)}:00`;
    const local = new Date(new Date(expires).getTime() - 4 * 60 * 6e4);
    const pad = (n) => n.toString().padStart(2, "0");
    return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}:00.000-04:00`;
  }
};
var vtec_default = VtecParser;

// src/parsers/types/vtec.ts
var VTECAlerts = class {
  /**
   * event processes validated VTEC alert messages, extracting relevant information and compiling it into structured event objects.
   *
   * @public
   * @static
   * @async
   * @param {types.TypeCompiled} validated 
   * @returns {*} 
   */
  static event(validated) {
    return __async(this, null, function* () {
      var _a;
      let processed = [];
      const messages = (_a = validated.message.split(/(?=\$\$)/g)) == null ? void 0 : _a.map((msg) => msg.trim());
      if (!messages || messages.length == 0) return;
      for (let i = 0; i < messages.length; i++) {
        const tick = performance.now();
        const message = messages[i];
        const getVTEC = yield vtec_default.vtecExtractor(message);
        const getUGC = yield ugc_default.ugcExtractor(message);
        if (getVTEC != null && getUGC != null) {
          for (let j = 0; j < getVTEC.length; j++) {
            const vtec = getVTEC[j];
            const getBaseProperties = yield events_default.getBaseProperties(message, validated, getUGC, vtec);
            const getHeader = events_default.getHeader(__spreadValues(__spreadValues({}, validated.attributes), getBaseProperties.attributes), getBaseProperties, vtec);
            processed.push({
              performance: performance.now() - tick,
              tracking: vtec.tracking,
              header: getHeader,
              vtec: vtec.raw,
              history: [{ description: getBaseProperties.description, issued: getBaseProperties.issued, type: vtec.status }],
              properties: __spreadValues({ event: vtec.event, parent: vtec.event, action_type: vtec.status }, getBaseProperties)
            });
          }
        }
      }
      events_default.validateEvents(processed);
    });
  }
};
var vtec_default2 = VTECAlerts;

// src/parsers/types/ugc.ts
var UGCAlerts = class {
  /**
   * getTracking generates a unique tracking identifier based on the sender's ICAO code and a hash of the UGC zones.
   *
   * @private
   * @static
   * @param {types.BaseProperties} baseProperties 
   * @param {string[]} zones 
   * @returns {string} 
   */
  static getTracking(baseProperties, zones) {
    return `${baseProperties.sender_icao} (${packages.crypto.createHash("md5").update(zones.join(``)).digest("hex")}})`;
  }
  /**
   * getEvent determines the event name based on offshore definitions or formats it from the attributes.
   *
   * @private
   * @static
   * @param {string} message 
   * @param {Record<string, any>} attributes 
   * @returns {*} 
   */
  static getEvent(message, attributes) {
    const offshoreEvent = Object.keys(definitions.offshore).find((event) => message.toLowerCase().includes(event.toLowerCase()));
    if (offshoreEvent != void 0) return Object.keys(definitions.offshore).find((event) => message.toLowerCase().includes(event.toLowerCase()));
    return attributes.type.split(`-`).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(` `);
  }
  /**
   * event processes validated UGC alert messages, extracting relevant information and compiling it into structured event objects.
   *
   * @public
   * @static
   * @async
   * @param {types.TypeCompiled} validated 
   * @returns {*} 
   */
  static event(validated) {
    return __async(this, null, function* () {
      var _a;
      let processed = [];
      const messages = (_a = validated.message.split(/(?=\$\$|ISSUED TIME...|=================================================)/g)) == null ? void 0 : _a.map((msg) => msg.trim());
      if (!messages || messages.length == 0) return;
      for (let i = 0; i < messages.length; i++) {
        const tick = performance.now();
        const message = messages[i];
        const getUGC = yield ugc_default.ugcExtractor(message);
        if (getUGC != null) {
          const getBaseProperties = yield events_default.getBaseProperties(message, validated, getUGC);
          const getHeader = events_default.getHeader(__spreadValues(__spreadValues({}, validated.attributes), getBaseProperties.attributes), getBaseProperties);
          const getEvent = this.getEvent(message, getBaseProperties.attributes.getAwip);
          processed.push({
            performance: performance.now() - tick,
            tracking: this.getTracking(getBaseProperties, getUGC.zones),
            header: getHeader,
            vtec: `N/A`,
            history: [{ description: getBaseProperties.description, issued: getBaseProperties.issued, type: `Issued` }],
            properties: __spreadValues({ event: getEvent, parent: getEvent, action_type: `Issued` }, getBaseProperties)
          });
        }
      }
      events_default.validateEvents(processed);
    });
  }
};
var ugc_default2 = UGCAlerts;

// src/parsers/types/text.ts
var UGCAlerts2 = class {
  static getTracking(baseProperties) {
    return `${baseProperties.sender_icao}`;
  }
  static getEvent(message, attributes) {
    const offshoreEvent = Object.keys(definitions.offshore).find((event) => message.toLowerCase().includes(event.toLowerCase()));
    if (offshoreEvent) return Object.keys(definitions.offshore).find((event) => message.toLowerCase().includes(event.toLowerCase()));
    return attributes.type.split(`-`).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(` `);
  }
  static event(validated) {
    return __async(this, null, function* () {
      var _a;
      let processed = [];
      const messages = (_a = validated.message.split(/(?=\$\$|ISSUED TIME...|=================================================)/g)) == null ? void 0 : _a.map((msg) => msg.trim());
      if (!messages || messages.length == 0) return;
      for (let i = 0; i < messages.length; i++) {
        const tick = performance.now();
        const message = messages[i];
        const getBaseProperties = yield events_default.getBaseProperties(message, validated);
        const getHeader = events_default.getHeader(__spreadValues(__spreadValues({}, validated.attributes), getBaseProperties.attributes), getBaseProperties);
        const getEvent = this.getEvent(message, getBaseProperties.attributes.getAwip);
        processed.push({
          performance: performance.now() - tick,
          tracking: this.getTracking(getBaseProperties),
          header: getHeader,
          vtec: `N/A`,
          history: [{ description: getBaseProperties.description, issued: getBaseProperties.issued, type: `Issued` }],
          properties: __spreadValues({ event: getEvent, parent: getEvent, action_type: `Issued` }, getBaseProperties)
        });
      }
      events_default.validateEvents(processed);
    });
  }
};
var text_default2 = UGCAlerts2;

// src/parsers/types/cap.ts
var CapAlerts = class {
  static getTracking(extracted) {
    return extracted.vtec ? (() => {
      const vtecValue = Array.isArray(extracted.vtec) ? extracted.vtec[0] : extracted.vtec;
      const splitVTEC = vtecValue.split(".");
      return `${splitVTEC[2]}-${splitVTEC[3]}-${splitVTEC[4]}-${splitVTEC[5]}`;
    })() : `${extracted.wmoidentifier} (${extracted.ugc})`;
  }
  static event(validated) {
    return __async(this, null, function* () {
      var _a;
      let processed = [];
      const messages = (_a = validated.message.match(/<\?xml[\s\S]*?<\/alert>/g)) == null ? void 0 : _a.map((msg) => msg.trim());
      if (messages == null || messages.length === 0) return;
      for (let message of messages) {
        const tick = performance.now();
        message = message.substring(message.indexOf(`<?xml version="1.0"`), message.lastIndexOf(`>`) + 1);
        const parser = new packages.xml2js.Parser({ explicitArray: false, mergeAttrs: true, trim: true });
        const parsed = yield parser.parseStringPromise(message);
        if (parsed == null || parsed.alert == null) continue;
        const extracted = text_default.getXmlValues(parsed, [
          `vtec`,
          `wmoidentifier`,
          `ugc`,
          `areadesc`,
          `expires`,
          `sent`,
          `msgtype`,
          `description`,
          `event`,
          `sendername`,
          `tornadodetection`,
          `polygon`,
          `maxHailSize`,
          `maxWindGust`,
          `thunderstormdamagethreat`,
          `tornadodamagethreat`,
          `waterspoutdetection`,
          `flooddetection`
        ]);
        const getHeader = events_default.getHeader(__spreadValues({}, validated.attributes));
        const getSource = text_default.textProductToString(extracted.description, `SOURCE...`, [`.`]) || `N/A`;
        processed.push({
          performance: performance.now() - tick,
          tracking: this.getTracking(extracted),
          header: getHeader,
          vtec: extracted.vtec || `N/A`,
          history: [{ description: extracted.description || `N/A`, issued: extracted.sent ? new Date(extracted.sent).toLocaleString() : `N/A`, type: extracted.msgtype || `N/A` }],
          properties: {
            locations: extracted.areadesc || `N/A`,
            event: extracted.event || `N/A`,
            issued: extracted.sent ? new Date(extracted.sent).toLocaleString() : `N/A`,
            expires: extracted.expires ? new Date(extracted.expires).toLocaleString() : `N/A`,
            parent: extracted.event || `N/A`,
            action_type: extracted.msgtype || `N/A`,
            description: extracted.description || `N/A`,
            sender_name: extracted.sendername || `N/A`,
            sender_icao: extracted.wmoidentifier ? extracted.wmoidentifier.substring(extracted.wmoidentifier.length - 4) : `N/A`,
            attributes: validated.attributes,
            geocode: {
              UGC: [extracted.ugc]
            },
            parameters: {
              wmo: extracted.wmoidentifier || `N/A`,
              source: getSource,
              max_hail_size: extracted.maxHailSize || `N/A`,
              max_wind_gust: extracted.maxWindGust || `N/A`,
              damage_threat: extracted.thunderstormdamagethreat || `N/A`,
              tornado_detection: extracted.tornadodetection || extracted.waterspoutdetection || `N/A`,
              flood_detection: extracted.flooddetection || `N/A`,
              discussion_tornado_intensity: `N/A`,
              discussion_wind_intensity: `N/A`,
              discussion_hail_intensity: `N/A`
            },
            geometry: extracted.polygon ? {
              type: `Polygon`,
              coordinates: extracted.polygon.split(` `).map((coord) => {
                const [lon, lat] = coord.split(`,`).map((num) => parseFloat(num));
                return [lat, lon];
              })
            } : null
          }
        });
      }
      events_default.validateEvents(processed);
    });
  }
};
var cap_default = CapAlerts;

// src/parsers/types/api.ts
var APIAlerts = class {
  static getTracking(extracted) {
    return extracted.vtec ? (() => {
      const vtecValue = Array.isArray(extracted.vtec) ? extracted.vtec[0] : extracted.vtec;
      const splitVTEC = vtecValue.split(".");
      return `${splitVTEC[2]}-${splitVTEC[3]}-${splitVTEC[4]}-${splitVTEC[5]}`;
    })() : `${extracted.wmoidentifier} (${extracted.ugc})`;
  }
  static getICAO(vtec) {
    var _a, _b;
    const icao = vtec ? vtec.split(`.`)[2] : `N/A`;
    const name = (_b = (_a = definitions.ICAO) == null ? void 0 : _a[icao]) != null ? _b : `N/A`;
    return { icao, name };
  }
  static event(validated) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S, _T, _U, _V, _W, _X, _Y, _Z, __, _$, _aa, _ba, _ca, _da, _ea, _fa, _ga, _ha, _ia;
      let processed = [];
      const messages = Object.values(JSON.parse(validated.message).features);
      for (let feature of messages) {
        const tick = performance.now();
        const getVTEC = (_d = (_c = (_b = (_a = feature == null ? void 0 : feature.properties) == null ? void 0 : _a.parameters) == null ? void 0 : _b.VTEC) == null ? void 0 : _c[0]) != null ? _d : null;
        const getWmo = (_g = (_f = (_e = feature == null ? void 0 : feature.properties) == null ? void 0 : _e.parameters) == null ? void 0 : _f.WMOidentifier[0]) != null ? _g : null;
        const getUgc = (_j = (_i = (_h = feature == null ? void 0 : feature.properties) == null ? void 0 : _h.geocode) == null ? void 0 : _i.UGC) != null ? _j : null;
        const getHeadline = (_n = (_m = (_l = (_k = feature == null ? void 0 : feature.properties) == null ? void 0 : _k.parameters) == null ? void 0 : _l.NWSheadline) == null ? void 0 : _m[0]) != null ? _n : "";
        const getDescription = `${getHeadline} ${(_p = (_o = feature == null ? void 0 : feature.properties) == null ? void 0 : _o.description) != null ? _p : ``}`;
        const getAWIP = (_t = (_s = (_r = (_q = feature == null ? void 0 : feature.properties) == null ? void 0 : _q.parameters) == null ? void 0 : _r.AWIPSidentifier) == null ? void 0 : _s[0]) != null ? _t : null;
        const getHeader = events_default.getHeader(__spreadValues({}, { getAwip: { prefix: getAWIP == null ? void 0 : getAWIP.slice(0, -3) } }));
        const getSource = text_default.textProductToString(getDescription, `SOURCE...`, [`.`]) || `N/A`;
        const getOffice = this.getICAO(getVTEC || ``);
        processed.push({
          performance: performance.now() - tick,
          tracking: this.getTracking({ vtec: getVTEC, wmoidentifier: getWmo, ugc: getUgc ? getUgc.join(`,`) : null }),
          header: getHeader,
          vtec: getVTEC || `N/A`,
          history: [{
            description: (_v = (_u = feature == null ? void 0 : feature.properties) == null ? void 0 : _u.description) != null ? _v : `N/A`,
            action: (_x = (_w = feature == null ? void 0 : feature.properties) == null ? void 0 : _w.messageType) != null ? _x : `N/A`,
            time: ((_y = feature == null ? void 0 : feature.properties) == null ? void 0 : _y.sent) ? new Date((_z = feature == null ? void 0 : feature.properties) == null ? void 0 : _z.sent).toLocaleString() : `N/A`
          }],
          properties: {
            locations: (_B = (_A = feature == null ? void 0 : feature.properties) == null ? void 0 : _A.areaDesc) != null ? _B : `N/A`,
            event: (_D = (_C = feature == null ? void 0 : feature.properties) == null ? void 0 : _C.event) != null ? _D : `N/A`,
            issued: ((_E = feature == null ? void 0 : feature.properties) == null ? void 0 : _E.sent) ? new Date((_F = feature == null ? void 0 : feature.properties) == null ? void 0 : _F.sent).toLocaleString() : `N/A`,
            expires: ((_G = feature == null ? void 0 : feature.properties) == null ? void 0 : _G.expires) ? new Date((_H = feature == null ? void 0 : feature.properties) == null ? void 0 : _H.expires).toLocaleString() : `N/A`,
            parent: (_J = (_I = feature == null ? void 0 : feature.properties) == null ? void 0 : _I.event) != null ? _J : `N/A`,
            action_type: (_L = (_K = feature == null ? void 0 : feature.properties) == null ? void 0 : _K.messageType) != null ? _L : `N/A`,
            description: (_N = (_M = feature == null ? void 0 : feature.properties) == null ? void 0 : _M.description) != null ? _N : `N/A`,
            sender_name: getOffice.name || `N/A`,
            sender_icao: getOffice.icao || `N/A`,
            attributes: validated.attributes,
            geocode: {
              UGC: (_Q = (_P = (_O = feature == null ? void 0 : feature.properties) == null ? void 0 : _O.geocode) == null ? void 0 : _P.UGC) != null ? _Q : [`XX000`]
            },
            parameters: {
              wmo: ((_T = (_S = (_R = feature == null ? void 0 : feature.properties) == null ? void 0 : _R.parameters) == null ? void 0 : _S.WMOidentifier) == null ? void 0 : _T[0]) || getWmo || `N/A`,
              source: getSource,
              max_hail_size: ((_V = (_U = feature == null ? void 0 : feature.properties) == null ? void 0 : _U.parameters) == null ? void 0 : _V.maxHailSize) || `N/A`,
              max_wind_gust: ((_X = (_W = feature == null ? void 0 : feature.properties) == null ? void 0 : _W.parameters) == null ? void 0 : _X.maxWindGust) || `N/A`,
              damage_threat: ((_Z = (_Y = feature == null ? void 0 : feature.properties) == null ? void 0 : _Y.parameters) == null ? void 0 : _Z.thunderstormDamageThreat) || [`N/A`],
              tornado_detection: ((_$ = (__ = feature == null ? void 0 : feature.properties) == null ? void 0 : __.parameters) == null ? void 0 : _$.tornadoDetection) || [`N/A`],
              flood_detection: ((_ba = (_aa = feature == null ? void 0 : feature.properties) == null ? void 0 : _aa.parameters) == null ? void 0 : _ba.floodDetection) || [`N/A`],
              discussion_tornado_intensity: "N/A",
              peakWindGust: `N/A`,
              peakHailSize: `N/A`
            },
            geometry: ((_ea = (_da = (_ca = feature == null ? void 0 : feature.geometry) == null ? void 0 : _ca.coordinates) == null ? void 0 : _da[0]) == null ? void 0 : _ea.length) ? {
              type: ((_fa = feature == null ? void 0 : feature.geometry) == null ? void 0 : _fa.type) || "Polygon",
              coordinates: (_ia = (_ha = (_ga = feature == null ? void 0 : feature.geometry) == null ? void 0 : _ga.coordinates) == null ? void 0 : _ha[0]) == null ? void 0 : _ia.map((coord) => {
                const [lon, lat] = Array.isArray(coord) ? coord : [0, 0];
                return [lat, lon];
              })
            } : null
          }
        });
      }
      events_default.validateEvents(processed);
    });
  }
};
var api_default = APIAlerts;

// src/parsers/stanza.ts
var StanzaParser = class {
  /**
   * validate handles the validation of incoming XMPP stanzas to ensure they contain valid alert data.
   * You can also feed debug / cache data directly into this function by specifying the second parameter
   * which is the attributes object that would normally be parsed from the XMPP stanza.
   *
   * @public
   * @static
   * @param {*} stanza 
   * @param {(boolean | types.TypeAttributes)} [isDebug=false] 
   * @returns {{ message: any; attributes: types.TypeAttributes; isCap: any; isVtec: boolean; isCapDescription: any; awipsType: any; isApi: boolean; ignore: boolean; }} 
   */
  static validate(stanza, isDebug = false) {
    var _a;
    if (isDebug !== false) {
      const vTypes = isDebug;
      const message = stanza;
      const attributes = vTypes;
      const isCap = (_a = vTypes.isCap) != null ? _a : message.includes(`<?xml`);
      const isCapDescription = message.includes(`<areaDesc>`);
      const isVtec = message.match(definitions.expressions.vtec) != null;
      const isUGC = message.match(definitions.expressions.ugc1) != null;
      const awipsType = this.getType(attributes);
      return { message, attributes, isCap, isVtec, isUGC, isCapDescription, awipsType, isApi: false, ignore: false };
    }
    if (stanza.is(`message`)) {
      let cb = stanza.getChild(`x`);
      if (cb && cb.children) {
        let message = unescape(cb.children[0]);
        let attributes = cb.attrs;
        if (attributes.awipsid && attributes.awipsid.length > 1) {
          const isCap = message.includes(`<?xml`);
          const isCapDescription = message.includes(`<areaDesc>`);
          const isVtec = message.match(definitions.expressions.vtec) != null;
          const isUGC = message.match(definitions.expressions.ugc1) != null;
          const awipsType = this.getType(attributes);
          const isApi = false;
          this.cache({ message, attributes, isCap, isVtec, awipsType: awipsType.type, awipsPrefix: awipsType.prefix });
          return { message, attributes, isCap, isApi, isVtec, isUGC, isCapDescription, awipsType, ignore: false };
        }
      }
    }
    return { message: null, attributes: null, isApi: null, isCap: null, isVtec: null, isUGC: null, isCapDescription: null, awipsType: null, ignore: true };
  }
  /**
   * getType determines the AWIPS type of the alert based on its attributes, specifically the awipsid.
   * If no matching type is found, it defaults to 'default'.
   *
   * @private
   * @static
   * @param {unknown} attributes 
   * @returns {*} 
   */
  static getType(attributes) {
    const attrs = attributes;
    if (!attrs || !attrs.awipsid) return { type: `XX`, prefix: `XX` };
    for (const [prefix, type] of Object.entries(definitions.awips)) {
      if (attrs.awipsid.startsWith(prefix)) {
        return { type, prefix };
      }
    }
    return { type: `XX`, prefix: `XX` };
  }
  /**
   * cache stores the compiled alert data into a cache file if caching is enabled in the settings.
   *
   * @private
   * @static
   * @param {unknown} compiled 
   */
  static cache(compiled) {
    const data = compiled;
    const settings2 = settings;
    if (!settings2.NoaaWeatherWireService.cache.directory) return;
    if (!packages.fs.existsSync(settings2.NoaaWeatherWireService.cache.directory)) {
      packages.fs.mkdirSync(settings2.NoaaWeatherWireService.cache.directory, { recursive: true });
    }
    data.message = data.message.replace(/\$\$/g, `
STANZA ATTRIBUTES...${JSON.stringify(data.attributes)}
ISSUED TIME...${(/* @__PURE__ */ new Date()).toISOString()}
$$$
`);
    if (!data.message.includes(`STANZA ATTRIBUTES...`)) {
      data.message += `
STANZA ATTRIBUTES...${JSON.stringify(data.attributes)}
ISSUED TIME...${(/* @__PURE__ */ new Date()).toISOString()}
$$
`;
    }
    packages.fs.appendFileSync(`${settings2.NoaaWeatherWireService.cache.directory}/category-${data.awipsPrefix}-${data.awipsType}s-${data.isCap ? `cap` : `raw`}${data.isVtec ? `-vtec` : ``}.bin`, `=================================================
${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}
=================================================
${data.message}`, "utf8");
    packages.fs.appendFileSync(`${settings2.NoaaWeatherWireService.cache.directory}/cache-${data.isCap ? `cap` : `raw`}${data.isVtec ? `-vtec` : ``}.bin`, `=================================================
${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}
=================================================
${data.message}`, "utf8");
  }
};
var stanza_default = StanzaParser;

// src/database.ts
var Database = class {
  /**
   * handleAlertCache stores a unique alert in the SQLite database and ensures the total number of alerts does not exceed 5000.
   *
   * @public
   * @static
   * @async
   * @param {*} alert 
   * @returns {*} 
   */
  static stanzaCacheImport(stanza) {
    return __async(this, null, function* () {
      const settings2 = settings;
      cache.db.prepare(`INSERT OR IGNORE INTO stanzas (stanza) VALUES (?)`).run(stanza);
      const count = cache.db.prepare(`SELECT COUNT(*) as total FROM stanzas`).get();
      if (count.total > settings2.NoaaWeatherWireService.cache.maxHistory) {
        cache.db.prepare(`DELETE FROM stanzas WHERE rowid IN (SELECT rowid FROM stanzas ORDER BY rowid ASC LIMIT ?)`).run(count.total - settings2.NoaaWeatherWireService.cache.maxHistory / 2);
      }
    });
  }
  /**
   * loadDatabase initializes the SQLite database and imports shapefile data if the database or table does not exist.
   *
   * @public
   * @static
   * @async
   * @returns {Promise<void>} 
   */
  static loadDatabase() {
    return __async(this, null, function* () {
      const settings2 = settings;
      try {
        if (!packages.fs.existsSync(settings2.database)) {
          packages.fs.writeFileSync(settings2.database, "");
        }
        cache.db = new packages.sqlite3(settings2.database);
        const shapfileTable = cache.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='shapefiles'`).get();
        const stanzaTable = cache.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='stanzas'`).get();
        if (!stanzaTable) {
          cache.db.prepare(`CREATE TABLE stanzas (id INTEGER PRIMARY KEY AUTOINCREMENT, stanza TEXT)`).run();
        }
        if (!shapfileTable) {
          cache.db.prepare(`CREATE TABLE shapefiles (id TEXT PRIMARY KEY, location TEXT, geometry TEXT)`).run();
          console.log(definitions.messages.shapefile_creation);
          for (const shape of definitions.shapefiles) {
            const { id, file } = shape;
            const filepath = packages.path.join(__dirname, `../../shapefiles`, file);
            const { features } = yield packages.shapefile.read(filepath, filepath);
            console.log(`Importing ${features.length} entries from ${file}...`);
            const insertStmt = cache.db.prepare(`INSERT OR REPLACE INTO shapefiles (id, location, geometry)VALUES (?, ?, ?)`);
            const insertTransaction = cache.db.transaction((entries) => {
              for (const feature of entries) {
                const { properties, geometry } = feature;
                let final, location;
                switch (true) {
                  case !!properties.FIPS:
                    final = `${properties.STATE}${id}${properties.FIPS.substring(2)}`;
                    location = `${properties.COUNTYNAME}, ${properties.STATE}`;
                    break;
                  case !!properties.FULLSTAID:
                    final = `${properties.ST}${id}${properties.WFO}`;
                    location = `${properties.CITY}, ${properties.STATE}`;
                    break;
                  case !!properties.STATE:
                    final = `${properties.STATE}${id}${properties.ZONE}`;
                    location = `${properties.NAME}, ${properties.STATE}`;
                    break;
                  default:
                    final = properties.ID;
                    location = properties.NAME;
                    break;
                }
                insertStmt.run(final, location, JSON.stringify(geometry));
              }
            });
            yield insertTransaction(features);
          }
          console.log(definitions.messages.shapefile_creation_finished);
        }
      } catch (error) {
        cache.events.emit("onError", { code: "error-load-database", message: `Failed to load database: ${error.message}` });
      }
    });
  }
};
var database_default = Database;

// src/xmpp.ts
var Xmpp = class {
  /**
   * isSessionReconnectionEligible checks if the XMPP session is eligible for reconnection based on the last 
   * received stanza time and current interval.
   *
   * @public
   * @static
   * @async
   * @param {number} currentInterval 
   * @returns {Promise<void>} 
   */
  static isSessionReconnectionEligible(currentInterval) {
    return __async(this, null, function* () {
      const settings2 = settings;
      if ((cache.isConnected || cache.sigHalt) && cache.session) {
        const lastStanza = Date.now() - cache.lastStanza;
        if (lastStanza >= currentInterval * 1e3) {
          if (!cache.attemptingReconnect) {
            cache.attemptingReconnect = true;
            cache.isConnected = false;
            cache.totalReconnects += 1;
            cache.events.emit(`onReconnect`, { reconnects: cache.totalReconnects, lastStanza, lastName: settings2.NoaaWeatherWireService.clientCredentials.nickname });
            yield cache.session.stop().catch(() => {
            });
            yield cache.session.start().catch(() => {
            });
          }
        }
      }
    });
  }
  /**
   * deploySession initializes and starts the XMPP client session, setting up event listeners for 
   * connection management and message handling. This function is specifically tailored for
   * NoaaWeatherWireService and connects to their XMPP server.
   *
   * @public
   * @static
   * @async
   * @returns {Promise<void>} 
   */
  static deploySession() {
    return __async(this, null, function* () {
      var _a, _b;
      const settings2 = settings;
      cache.session = packages.xmpp.client({
        service: `xmpp://nwws-oi.weather.gov`,
        domain: `nwws-oi.weather.gov`,
        username: settings2.NoaaWeatherWireService.clientCredentials.username,
        password: settings2.NoaaWeatherWireService.clientCredentials.password
      });
      (_b = (_a = settings2.NoaaWeatherWireService.clientCredentials).nickname) != null ? _b : _a.nickname = settings2.NoaaWeatherWireService.clientCredentials.username;
      cache.session.on(`online`, (address) => __async(null, null, function* () {
        if (cache.lastConnect && Date.now() - cache.lastConnect < 10 * 1e3) {
          cache.sigHalt = true;
          utils_default.sleep(2 * 1e3).then(() => __async(null, null, function* () {
            yield cache.session.stop();
          }));
          cache.events.emit(`onError`, { code: `error-reconnecting-too-fast`, message: `The client is attempting to reconnect too fast. Please wait a few seconds before trying again.` });
          return;
        }
        cache.isConnected = true;
        cache.sigHalt = false;
        cache.lastConnect = Date.now();
        cache.session.send(packages.xmpp.xml("presence", { to: `nwws@conference.nwws-oi.weather.gov/${settings2.NoaaWeatherWireService.clientCredentials.nickname}`, xmlns: "http://jabber.org/protocol/muc" }));
        cache.session.send(packages.xmpp.xml("presence", { to: `nwws@conference.nwws-oi.weather.gov`, type: "available" }));
        cache.events.emit(`onConnection`, settings2.NoaaWeatherWireService.clientCredentials.nickname);
        if (cache.attemptingReconnect) {
          utils_default.sleep(15 * 1e3).then(() => {
            cache.attemptingReconnect = false;
          });
        }
      }));
      cache.session.on(`offline`, () => __async(null, null, function* () {
        cache.isConnected = false;
        cache.sigHalt = true;
        cache.events.emit(`onError`, { code: `connection-lost`, message: `XMPP connection went offline` });
      }));
      cache.session.on(`error`, (error) => __async(null, null, function* () {
        cache.isConnected = false;
        cache.sigHalt = true;
        cache.events.emit(`onError`, { code: `connection-error`, message: error.message });
      }));
      cache.session.on(`stanza`, (stanza) => __async(null, null, function* () {
        try {
          cache.lastStanza = Date.now();
          if (stanza.is(`message`)) {
            const validate = stanza_default.validate(stanza);
            if (validate.ignore || validate.isCap && !settings2.NoaaWeatherWireService.alertPreferences.isCapOnly || !validate.isCap && settings2.NoaaWeatherWireService.alertPreferences.isCapOnly || validate.isCap && !validate.isCapDescription) return;
            events_default.eventHandler(validate);
            cache.events.emit(`onMessage`, validate);
            database_default.stanzaCacheImport(JSON.stringify(validate));
          }
          if (stanza.is(`presence`) && stanza.attrs.from && stanza.attrs.from.startsWith("nwws@conference.nwws-oi.weather.gov/")) {
            const occupant = stanza.attrs.from.split("/").slice(1).join("/");
            cache.events.emit("onOccupant", { occupant, type: stanza.attrs.type === "unavailable" ? "unavailable" : "available" });
          }
        } catch (e) {
          cache.events.emit(`onError`, { code: `error-processing-stanza`, message: e.message });
        }
      }));
      yield cache.session.start();
    });
  }
};
var xmpp_default = Xmpp;

// src/utils.ts
var Utils = class {
  /**
   * Zzzzzzz... yeah not much to explain here. Simple sleep function that returns a promise after the specified milliseconds.
   *
   * @public
   * @static
   * @async
   * @param {number} ms 
   * @returns {Promise<void>} 
   */
  static sleep(ms) {
    return __async(this, null, function* () {
      return new Promise((resolve) => setTimeout(resolve, ms));
    });
  }
  /**
   * loadCollectionCache reads cached alert files from the specified cache directory and processes them.
   *
   * @public
   * @static
   * @async
   * @returns {Promise<void>} 
   */
  static loadCollectionCache() {
    return __async(this, null, function* () {
      try {
        const settings2 = settings;
        if (settings2.NoaaWeatherWireService.cache.read && settings2.NoaaWeatherWireService.cache.directory) {
          if (!packages.fs.existsSync(settings2.NoaaWeatherWireService.cache.directory)) return;
          const cacheDir = settings2.NoaaWeatherWireService.cache.directory;
          const getAllFiles = packages.fs.readdirSync(cacheDir).filter((file) => file.endsWith(".bin") && file.startsWith("cache-"));
          for (const file of getAllFiles) {
            const filepath = packages.path.join(cacheDir, file);
            const readFile = packages.fs.readFileSync(filepath, { encoding: "utf-8" });
            const readSize = packages.fs.statSync(filepath).size;
            if (readSize == 0) {
              continue;
            }
            const isCap = readFile.includes(`<?xml`);
            if (isCap && !settings2.NoaaWeatherWireService.alertPreferences.isCapOnly) continue;
            if (!isCap && settings2.NoaaWeatherWireService.alertPreferences.isCapOnly) continue;
            const validate = stanza_default.validate(readFile, { awipsid: file, isCap, raw: true, issue: void 0 });
            yield events_default.eventHandler(validate);
          }
        }
      } catch (error) {
        cache.events.emit("onError", { code: "error-load-cache", message: `Failed to load cache: ${error.message}` });
      }
    });
  }
  /**
   * loadGeoJsonData fetches GeoJSON data from the National Weather Service endpoint and processes each alert.
   *
   * @public
   * @static
   * @async
   * @returns {Promise<void>} 
   */
  static loadGeoJsonData() {
    return __async(this, null, function* () {
      try {
        const settings2 = settings;
        const response = yield this.createHttpRequest(settings2.NationalWeatherService.endpoint);
        if (!response.error) {
          events_default.eventHandler({ message: JSON.stringify(response.message), attributes: {}, isCap: true, isApi: true, isVtec: false, isUGC: false, isCapDescription: false, awipsType: { type: "api", prefix: "AP" }, ignore: false });
        }
      } catch (error) {
        cache.events.emit("onError", { code: "error-fetching-nws-data", message: `Failed to fetch NWS data: ${error.message}` });
      }
    });
  }
  /**
   * detectUncaughtExceptions sets up a global handler for uncaught exceptions in the Node.js process,
   *
   * @public
   * @static
   */
  static detectUncaughtExceptions() {
    if (cache.events.listenerCount("uncaughtException") > 0) return;
    cache.events.on("uncaughtException", (error) => {
      cache.events.emit(`onError`, { message: `Uncaught Exception: ${error.message}`, code: `error-uncaught-exception`, stack: error.stack });
    });
  }
  /**
   * createHttpRequest performs an HTTP GET request to the specified URL with optional settings.
   *
   * @public
   * @static
   * @async
   * @param {string} url 
   * @param {?types.HTTPSettings} [options] 
   * @returns {unknown} 
   */
  static createHttpRequest(url, options) {
    return __async(this, null, function* () {
      var _a, _b;
      const defaultOptions = {
        timeout: 1e4,
        headers: {
          "User-Agent": "AtmosphericX",
          "Accept": "application/geo+json, text/plain, */*; q=0.9",
          "Accept-Language": "en-US,en;q=0.9"
        }
      };
      const requestOptions = __spreadProps(__spreadValues(__spreadValues({}, defaultOptions), options), {
        headers: __spreadValues(__spreadValues({}, defaultOptions.headers), (_a = options == null ? void 0 : options.headers) != null ? _a : {})
      });
      try {
        const resp = yield packages.axios.get(url, {
          headers: requestOptions.headers,
          timeout: requestOptions.timeout,
          maxRedirects: 0,
          validateStatus: (status) => status === 200 || status === 500
        });
        return { error: false, message: resp.data };
      } catch (err) {
        return { error: true, message: (_b = err == null ? void 0 : err.message) != null ? _b : String(err) };
      }
    });
  }
  /**
   * garbageCollectionCache removes files from the cache directory that exceed the specified maximum file size in megabytes.
   *
   * @public
   * @static
   * @param {number} maxFileMegabytes 
   */
  static garbageCollectionCache(maxFileMegabytes) {
    try {
      const settings2 = settings;
      if (!settings2.NoaaWeatherWireService.cache.directory) return;
      if (!packages.fs.existsSync(settings2.NoaaWeatherWireService.cache.directory)) return;
      const maxBytes = maxFileMegabytes * 1024 * 1024;
      const cacheDirectory = settings2.NoaaWeatherWireService.cache.directory;
      const stackFiles = [cacheDirectory], files = [];
      while (stackFiles.length) {
        const currentDirectory = stackFiles.pop();
        packages.fs.readdirSync(currentDirectory).forEach((file) => {
          const fullPath = packages.path.join(currentDirectory, file);
          const stat = packages.fs.statSync(fullPath);
          if (stat.isDirectory()) stackFiles.push(fullPath);
          else files.push({ file: fullPath, size: stat.size });
        });
      }
      if (!files.length) return;
      files.forEach((f) => {
        if (f.size > maxBytes) packages.fs.unlinkSync(f.file);
      });
    } catch (error) {
      cache.events.emit("onError", { code: "error-garbage-collection", message: `Failed to perform garbage collection: ${error.message}` });
    }
  }
  /**
   * handleCronJob performs periodic tasks based on whether the client is connected to NWWS or fetching data from NWS.
   *
   * @public
   * @static
   * @param {boolean} isNwws 
   */
  static handleCronJob(isNwws) {
    try {
      const settings2 = settings;
      if (isNwws) {
        if (settings2.NoaaWeatherWireService.cache.read) void this.garbageCollectionCache(settings2.NoaaWeatherWireService.cache.maxSizeMB);
        if (settings2.NoaaWeatherWireService.clientReconnections.canReconnect) void xmpp_default.isSessionReconnectionEligible(settings2.NoaaWeatherWireService.clientReconnections.currentInterval);
      } else {
        void this.loadGeoJsonData();
      }
    } catch (error) {
      cache.events.emit("onError", { code: "error-cron-job", message: `Failed to perform scheduled tasks: ${error.message}` });
    }
  }
  /**
   * mergeClientSettings merges user-provided settings into the existing client settings, allowing for nested objects to be merged correctly.
   *
   * @public
   * @static
   * @param {Record<string, any>} target 
   * @param {Record<string, any>} settings 
   */
  static mergeClientSettings(target, settings2) {
    for (const key in settings2) {
      if (settings2.hasOwnProperty(key)) {
        if (typeof settings2[key] === "object" && settings2[key] !== null && !Array.isArray(settings2[key])) {
          if (!target[key] || typeof target[key] !== "object") {
            target[key] = {};
          }
          this.mergeClientSettings(target[key], settings2[key]);
        } else {
          target[key] = settings2[key];
        }
      }
    }
  }
};
var utils_default = Utils;

// src/eas.ts
var EAS = class {
  /**
   * generateEASAudio creates an EAS-compliant audio file in WAV format containing the provided message and VTEC header.
   *
   * @public
   * @static
   * @param {string} message 
   * @param {string} vtec 
   * @returns {*} 
   */
  static generateEASAudio(message, vtec) {
    return new Promise((resolve) => __async(this, null, function* () {
      const settings2 = settings;
      for (const { regex, replacement } of definitions.messageSignatures) {
        message = message.replace(regex, replacement);
      }
      const assetsDir = settings2.global.easSettings.easDirectory;
      if (!assetsDir) {
        console.warn(definitions.messages.eas_no_directory);
        return resolve(null);
      }
      const rngFile = `${vtec.replace(/[^a-zA-Z0-9]/g, `_`)}`.substring(0, 32).replace(/^_+|_+$/g, "");
      if (!packages.fs.existsSync(assetsDir)) {
        packages.fs.mkdirSync(assetsDir);
      }
      const tmpTTS = packages.path.join(assetsDir, `/tmp/${rngFile}.wav`);
      const outTTS = packages.path.join(assetsDir, `/output/${rngFile}.wav`);
      const voice = process.platform === "win32" ? "Microsoft David Desktop" : "en-US-GuyNeural";
      if (!packages.fs.existsSync(packages.path.join(assetsDir, `/tmp`))) {
        packages.fs.mkdirSync(packages.path.join(assetsDir, `/tmp`), { recursive: true });
      }
      if (!packages.fs.existsSync(packages.path.join(assetsDir, `/output`))) {
        packages.fs.mkdirSync(packages.path.join(assetsDir, `/output`), { recursive: true });
      }
      packages.say.export(message, voice, 1, tmpTTS);
      yield utils_default.sleep(2500);
      let ttsBuffer = null;
      while (!packages.fs.existsSync(tmpTTS) || (ttsBuffer = packages.fs.readFileSync(tmpTTS)).length === 0) {
        yield utils_default.sleep(500);
      }
      const ttsWav = this.parseWavPCM16(ttsBuffer);
      const ttsSamples = this.resamplePCM16(ttsWav.samples, ttsWav.sampleRate, 8e3);
      const ttsRadio = this.applyNWREffect(ttsSamples, 8e3);
      let toneRadio = null;
      if (packages.fs.existsSync(settings2.global.easSettings.easIntroWav)) {
        const toneBuffer = packages.fs.readFileSync(settings2.global.easSettings.easIntroWav);
        const toneWav = this.parseWavPCM16(toneBuffer);
        const toneSamples = toneWav.sampleRate !== 8e3 ? this.resamplePCM16(toneWav.samples, toneWav.sampleRate, 8e3) : toneWav.samples;
        toneRadio = this.applyNWREffect(toneSamples, 8e3);
      }
      let build = toneRadio != null ? [toneRadio, this.generateSilence(0.5, 8e3)] : [];
      build.push(this.generateSAMEHeader(vtec, 3, 8e3, { preMarkSec: 1.1, gapSec: 0.5 }), this.generateSilence(0.5, 8e3), this.generateAttentionTone(8, 8e3), this.generateSilence(0.5, 8e3), ttsRadio);
      for (let i = 0; i < 3; i++) {
        build.push(this.generateSAMEHeader(vtec, 1, 8e3, { preMarkSec: 0.5, gapSec: 0.1 }));
        build.push(this.generateSilence(0.5, 8e3));
      }
      const allSamples = this.concatPCM16(build);
      const finalSamples = this.addNoise(allSamples, 2e-3);
      const outBuffer = this.encodeWavPCM16(Array.from(finalSamples).map((v) => ({ value: v })), 8e3);
      packages.fs.writeFileSync(outTTS, outBuffer);
      try {
        packages.fs.unlinkSync(tmpTTS);
      } catch (error) {
        if (error.code !== "EBUSY") {
          throw error;
        }
      }
      return Promise.resolve(outTTS);
    }));
  }
  /**
   * encodeWavPCM16 encodes an array of samples into a WAV PCM 16-bit Buffer.
   *
   * @private
   * @static
   * @param {Record<string, number>[]} samples 
   * @param {number} [sampleRate=8000] 
   * @returns {Buffer} 
   */
  static encodeWavPCM16(samples, sampleRate = 8e3) {
    const bytesPerSample = 2;
    const blockAlign = 1 * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const subchunk2Size = samples.length * bytesPerSample;
    const chunkSize = 36 + subchunk2Size;
    const buffer = Buffer.alloc(44 + subchunk2Size);
    let o = 0;
    buffer.write("RIFF", o);
    o += 4;
    buffer.writeUInt32LE(chunkSize, o);
    o += 4;
    buffer.write("WAVE", o);
    o += 4;
    buffer.write("fmt ", o);
    o += 4;
    buffer.writeUInt32LE(16, o);
    o += 4;
    buffer.writeUInt16LE(1, o);
    o += 2;
    buffer.writeUInt16LE(1, o);
    o += 2;
    buffer.writeUInt32LE(sampleRate, o);
    o += 4;
    buffer.writeUInt32LE(byteRate, o);
    o += 4;
    buffer.writeUInt16LE(blockAlign, o);
    o += 2;
    buffer.writeUInt16LE(16, o);
    o += 2;
    buffer.write("data", o);
    o += 4;
    buffer.writeUInt32LE(subchunk2Size, o);
    o += 4;
    for (let i = 0; i < samples.length; i++, o += 2) {
      buffer.writeInt16LE(samples[i].value, o);
    }
    return buffer;
  }
  /**
   * parseWavPCM16 decodes a WAV PCM 16-bit Buffer into its sample data and format information.
   *
   * @private
   * @static
   * @param {Buffer} buffer 
   * @returns {{ samples: any; sampleRate: any; channels: any; bitsPerSample: any; }} 
   */
  static parseWavPCM16(buffer) {
    if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
      return null;
    }
    let fmt = null;
    let data = null;
    let i = 12;
    while (i + 8 <= buffer.length) {
      const id = buffer.toString("ascii", i, i + 4);
      const size = buffer.readUInt32LE(i + 4);
      const start = i + 8;
      const end = start + size;
      if (id === "fmt ") fmt = buffer.slice(start, end);
      if (id === "data") data = buffer.slice(start, end);
      i = end + size % 2;
    }
    if (!fmt || !data) return null;
    const audioFormat = fmt.readUInt16LE(0);
    const channels = fmt.readUInt16LE(2);
    const sampleRate = fmt.readUInt32LE(4);
    const bitsPerSample = fmt.readUInt16LE(14);
    if (audioFormat !== 1 || bitsPerSample !== 16 || channels !== 1) {
      return null;
    }
    const samples = new Int16Array(data.buffer, data.byteOffset, data.length / 2);
    return { samples: new Int16Array(samples), sampleRate, channels, bitsPerSample };
  }
  /**
   * concatPCM16 concatenates multiple Int16Array buffers into a single Int16Array buffer.
   *
   * @private
   * @static
   * @param {Int16Array[]} arrays 
   * @returns {*} 
   */
  static concatPCM16(arrays) {
    let total = 0;
    for (const a of arrays) total += a.length;
    const out = new Int16Array(total);
    let o = 0;
    for (const a of arrays) {
      out.set(a, o);
      o += a.length;
    }
    return out;
  }
  /**
   * pcm16toFloat converts an Int16Array of PCM 16-bit samples to a Float32Array of normalized float samples.
   *
   * @private
   * @static
   * @param {Int16Array} int16 
   * @returns {*} 
   */
  static pcm16toFloat(int16) {
    const out = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) out[i] = int16[i] / 32768;
    return out;
  }
  /**
   * floatToPcm16 converts a Float32Array of normalized float samples to an Int16Array of PCM 16-bit samples.
   *
   * @private
   * @static
   * @param {Float32Array} float32 
   * @returns {*} 
   */
  static floatToPcm16(float32) {
    const out = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      let v = Math.max(-1, Math.min(1, float32[i]));
      out[i] = Math.round(v * 32767);
    }
    return out;
  }
  /**
   * resamplePCM16 resamples an Int16Array of PCM 16-bit samples from the original sample rate to the target sample rate using linear interpolation.
   *
   * @private
   * @static
   * @param {Int16Array} int16 
   * @param {number} originalRate 
   * @param {number} targetRate 
   * @returns {*} 
   */
  static resamplePCM16(int16, originalRate, targetRate) {
    if (originalRate === targetRate) return int16;
    const ratio = targetRate / originalRate;
    const outLen = Math.max(1, Math.round(int16.length * ratio));
    const out = new Int16Array(outLen);
    for (let i = 0; i < outLen; i++) {
      const pos = i / ratio;
      const i0 = Math.floor(pos);
      const i1 = Math.min(i0 + 1, int16.length - 1);
      const frac = pos - i0;
      const v = int16[i0] * (1 - frac) + int16[i1] * frac;
      out[i] = Math.round(v);
    }
    return out;
  }
  /**
   * generateSilence creates an Int16Array of PCM 16-bit samples representing silence for the specified duration in milliseconds.
   *
   * @private
   * @static
   * @param {number} ms 
   * @param {number} [sampleRate=8000] 
   * @returns {*} 
   */
  static generateSilence(ms, sampleRate = 8e3) {
    return new Int16Array(Math.floor(ms * sampleRate));
  }
  /**
   * generateAttentionTone creates an Int16Array of PCM 16-bit samples representing the EAS attention tone for the specified duration in milliseconds.
   *
   * @private
   * @static
   * @param {*} ms 
   * @param {number} [sampleRate=8000] 
   * @returns {*} 
   */
  static generateAttentionTone(ms, sampleRate = 8e3) {
    const len = Math.floor(ms * sampleRate);
    const out = new Int16Array(len);
    const f1 = 853;
    const f2 = 960;
    const twoPi = Math.PI * 2;
    const amp = 0.1;
    const fadeLen = Math.floor(sampleRate * 0);
    for (let i = 0; i < len; i++) {
      const t = i / sampleRate;
      const s = Math.sin(twoPi * f1 * t) + Math.sin(twoPi * f2 * t);
      let gain = 1;
      if (i < fadeLen) gain = i / fadeLen;
      else if (i > len - fadeLen) gain = (len - i) / fadeLen;
      const v = Math.max(-1, Math.min(1, s / 2 * amp * gain));
      out[i] = Math.round(v * 32767);
    }
    return out;
  }
  /**
   * applyNWREffect applies a series of audio processing effects to simulate the sound characteristics of NOAA Weather Radio broadcasts.
   *
   * @private
   * @static
   * @param {Int16Array} int16 
   * @param {number} [sampleRate=8000] 
   * @returns {*} 
   */
  static applyNWREffect(int16, sampleRate = 8e3) {
    const hpCut = 3555;
    const lpCut = 1600;
    const noiseLevel = 0;
    const crushBits = 8;
    const x = this.pcm16toFloat(int16);
    const dt = 1 / sampleRate;
    const rcHP = 1 / (2 * Math.PI * hpCut);
    const aHP = rcHP / (rcHP + dt);
    let yHP = 0, xPrev = 0;
    for (let i = 0; i < x.length; i++) {
      const xi = x[i];
      yHP = aHP * (yHP + xi - xPrev);
      xPrev = xi;
      x[i] = yHP;
    }
    const rcLP = 1 / (2 * Math.PI * lpCut);
    const aLP = dt / (rcLP + dt);
    let yLP = 0;
    for (let i = 0; i < x.length; i++) {
      yLP = yLP + aLP * (x[i] - yLP);
      x[i] = yLP;
    }
    const compGain = 2;
    const norm = Math.tanh(compGain);
    for (let i = 0; i < x.length; i++) x[i] = Math.tanh(x[i] * compGain) / norm;
    const levels = Math.pow(2, crushBits) - 1;
    return this.floatToPcm16(x);
  }
  /**
   * addNoise adds low-level white noise to an Int16Array of PCM 16-bit samples to simulate analog broadcast imperfections.
   *
   * @private
   * @static
   * @param {Int16Array} int16 
   * @param {number} [noiseLevel=0.02] 
   * @returns {*} 
   */
  static addNoise(int16, noiseLevel = 0.02) {
    const x = this.pcm16toFloat(int16);
    for (let i = 0; i < x.length; i++) x[i] += (Math.random() * 2 - 1) * noiseLevel;
    let peak = 0;
    for (let i = 0; i < x.length; i++) peak = Math.max(peak, Math.abs(x[i]));
    if (peak > 1) for (let i = 0; i < x.length; i++) x[i] *= 0.98 / peak;
    return this.floatToPcm16(x);
  }
  /**
   * asciiTo8N1Bits converts an ASCII string to a sequence of bits using 8-N-1 encoding (8 data bits, no parity, 1 stop bit).
   *
   * @private
   * @static
   * @param {string} str 
   * @returns {{}} 
   */
  static asciiTo8N1Bits(str) {
    const bits = [];
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i) & 255;
      bits.push(0);
      for (let b = 0; b < 8; b++) bits.push(c >> b & 1);
      bits.push(1, 1);
    }
    return bits;
  }
  /**
   * generateAFSK generates an Int16Array of PCM 16-bit samples representing AFSK modulation of the provided bit sequence.
   *
   * @private
   * @static
   * @param {number[]} bits 
   * @param {number} [sampleRate=8000] 
   * @returns {*} 
   */
  static generateAFSK(bits, sampleRate = 8e3) {
    const baud = 520.83;
    const markFreq = 2083.3;
    const spaceFreq = 1562.5;
    const amplitude = 0.6;
    const twoPi = Math.PI * 2;
    const result = [];
    let phase = 0;
    let frac = 0;
    for (let b = 0; b < bits.length; b++) {
      const bit = bits[b];
      const freq = bit ? markFreq : spaceFreq;
      const samplesPerBit = sampleRate / baud + frac;
      const n = Math.round(samplesPerBit);
      frac = samplesPerBit - n;
      const inc = twoPi * freq / sampleRate;
      for (let i = 0; i < n; i++) {
        result.push(Math.round(Math.sin(phase) * amplitude * 32767));
        phase += inc;
        if (phase > twoPi) phase -= twoPi;
      }
    }
    const fadeSamples = Math.floor(sampleRate * 2e-3);
    for (let i = 0; i < fadeSamples; i++) {
      const gain = i / fadeSamples;
      result[i] = Math.round(result[i] * gain);
      result[result.length - 1 - i] = Math.round(result[result.length - 1 - i] * gain);
    }
    return Int16Array.from(result);
  }
  /**
   * generateSAMEHeader generates an Int16Array of PCM 16-bit samples representing the SAME header repeated the specified number of times.
   *
   * @private
   * @static
   * @param {string} vtec 
   * @param {number} repeats 
   * @param {number} [sampleRate=8000] 
   * @param {{preMarkSec?: number, gapSec?: number}} [options={}] 
   * @returns {*} 
   */
  static generateSAMEHeader(vtec, repeats, sampleRate = 8e3, options = {}) {
    var _a, _b;
    const preMarkSec = (_a = options.preMarkSec) != null ? _a : 0.3;
    const gapSec = (_b = options.gapSec) != null ? _b : 0.1;
    const bursts = [];
    const gap = this.generateSilence(gapSec, sampleRate);
    for (let i = 0; i < repeats; i++) {
      const bodyBits = this.asciiTo8N1Bits(vtec);
      const body = this.generateAFSK(bodyBits, sampleRate);
      const extendedBodyDuration = Math.round(preMarkSec * sampleRate);
      const extendedBody = new Int16Array(extendedBodyDuration + gap.length);
      for (let j = 0; j < extendedBodyDuration; j++) {
        extendedBody[j] = Math.round(body[j % body.length] * 0.2);
      }
      extendedBody.set(gap, extendedBodyDuration);
      bursts.push(extendedBody);
      if (i !== repeats - 1) bursts.push(gap);
    }
    return this.concatPCM16(bursts);
  }
};
var eas_default = EAS;

// src/parsers/events.ts
var EventParser = class {
  /**
   * getBaseProperties extracts and compiles the base properties of an alert message, including location, timing, description, sender information, and various parameters.
   *
   * @public
   * @static
   * @async
   * @param {string} message 
   * @param {types.TypeCompiled} validated 
   * @param {types.UGCParsed} [ugc=null] 
   * @param {types.VTECParsed} [vtec=null] 
   * @returns {Promise<types.BaseProperties>} 
   */
  static getBaseProperties(message, validated, ugc = null, vtec = null) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const settings2 = settings;
      const definitions2 = {
        tornado: text_default.textProductToString(message, `TORNADO...`) || text_default.textProductToString(message, `WATERSPOUT...`) || `N/A`,
        hail: text_default.textProductToString(message, `MAX HAIL SIZE...`, [`IN`]) || text_default.textProductToString(message, `HAIL...`, [`IN`]) || `N/A`,
        gusts: text_default.textProductToString(message, `MAX WIND GUST...`) || text_default.textProductToString(message, `WIND...`) || `N/A`,
        flood: text_default.textProductToString(message, `FLASH FLOOD...`) || `N/A`,
        damage: text_default.textProductToString(message, `DAMAGE THREAT...`) || `N/A`,
        source: text_default.textProductToString(message, `SOURCE...`, [`.`]) || `N/A`,
        attributes: text_default.textProductToString(message, `STANZA ATTRIBUTES...`) ? JSON.parse(text_default.textProductToString(message, `STANZA ATTRIBUTES...`)) : null,
        polygon: text_default.textProductToPolygon(message),
        description: text_default.textProductToDescription(message, (_a = vtec == null ? void 0 : vtec.raw) != null ? _a : null),
        wmo: message.match(new RegExp(definitions.expressions.wmo, "imu")),
        mdTorIntensity: text_default.textProductToString(message, `MOST PROBABLE PEAK TORNADO INTENSITY...`) || `N/A`,
        mdWindGusts: text_default.textProductToString(message, `MOST PROBABLE PEAK WIND GUST...`) || `N/A`,
        mdHailSize: text_default.textProductToString(message, `MOST PROBABLE PEAK HAIL SIZE...`) || `N/A`
      };
      const getOffice = this.getICAO(vtec, (_c = (_b = validated.attributes) != null ? _b : definitions2.attributes) != null ? _c : {}, definitions2.wmo);
      const getCorrectIssued = this.getCorrectIssuedDate((_e = (_d = definitions2.attributes) != null ? _d : validated.attributes) != null ? _e : {});
      const getCorrectExpiry = this.getCorrectExpiryDate(vtec, ugc);
      const getAwip = text_default.awipTextToEvent((_g = (_f = definitions2.attributes) == null ? void 0 : _f.awipsid) != null ? _g : validated.awipsType.prefix);
      const base = {
        locations: (ugc == null ? void 0 : ugc.locations.join(`; `)) || `No Location Specified (UGC Missing)`,
        issued: getCorrectIssued,
        expires: getCorrectExpiry,
        geocode: { UGC: (ugc == null ? void 0 : ugc.zones) || [`XX000`] },
        description: definitions2.description,
        sender_name: getOffice.name,
        sender_icao: getOffice.icao,
        attributes: __spreadProps(__spreadValues(__spreadValues({}, validated.attributes), definitions2.attributes), {
          getAwip
        }),
        parameters: {
          wmo: Array.isArray(definitions2.wmo) ? definitions2.wmo[0] : (_h = definitions2.wmo) != null ? _h : `N/A`,
          source: definitions2.source,
          max_hail_size: definitions2.hail,
          max_wind_gust: definitions2.gusts,
          damage_threat: definitions2.damage,
          tornado_detection: definitions2.tornado,
          flood_detection: definitions2.flood,
          discussion_tornado_intensity: definitions2.mdTorIntensity,
          discussion_wind_intensity: definitions2.mdWindGusts,
          discussion_hail_intensity: definitions2.mdHailSize
        },
        geometry: definitions2.polygon.length > 0 ? { type: "Polygon", coordinates: definitions2.polygon } : null
      };
      if (settings2.NoaaWeatherWireService.alertPreferences.isShapefileUGC && base.geometry == null && ugc != null) {
        const coordinates = yield ugc_default.getCoordinates(ugc.zones);
        base.geometry = { type: "Polygon", coordinates };
      }
      return base;
    });
  }
  /**
   * enhanceEvent refines the event name based on specific conditions and tags found in the event's description and parameters.
   *
   * @public
   * @static
   * @param {types.TypeAlert} event 
   * @returns {{ eventName: any; tags: any; }} 
   */
  static enhanceEvent(event) {
    var _a, _b, _c, _d, _e;
    let eventName = (_b = (_a = event == null ? void 0 : event.properties) == null ? void 0 : _a.event) != null ? _b : `Unknown Event`;
    const defEventTable = definitions.enhancedEvents;
    const defEventTags = definitions.tags;
    const properties = event == null ? void 0 : event.properties;
    const parameters = properties == null ? void 0 : properties.parameters;
    const description = (_c = properties == null ? void 0 : properties.description) != null ? _c : `Unknown Description`;
    const damageThreatTag = (_d = parameters == null ? void 0 : parameters.damage_threat) != null ? _d : `N/A`;
    const tornadoThreatTag = (_e = parameters == null ? void 0 : parameters.tornado_detection) != null ? _e : `N/A`;
    for (const eventGroup of defEventTable) {
      const [baseEvent, conditions] = Object.entries(eventGroup)[0];
      if (eventName === baseEvent) {
        for (const [specificEvent, condition] of Object.entries(conditions)) {
          const conditionMet = condition.description && description.includes(condition.description.toLowerCase()) || condition.condition && condition.condition(damageThreatTag || tornadoThreatTag);
          if (conditionMet) {
            eventName = specificEvent;
            break;
          }
        }
        if (baseEvent === "Severe Thunderstorm Warning" && damageThreatTag === "POSSIBLE" && !eventName.includes("(TPROB)")) eventName += " (TPROB)";
        break;
      }
    }
    const tags = Object.entries(defEventTags).filter(([key]) => description.includes(key.toLowerCase())).map(([, value]) => value);
    return { eventName, tags: tags.length > 0 ? tags : [`N/A`] };
  }
  /**
   * getCorrectExpiryDate determines the correct expiration date for an alert based on VTEC information or UGC zones.
   *
   * @public
   * @static
   * @param {unknown[]} events 
   */
  static validateEvents(events2) {
    var _a, _b, _c, _d, _e;
    if (events2.length == 0) return;
    const settings2 = settings;
    const filteringSettings = (_b = (_a = settings) == null ? void 0 : _a.global) == null ? void 0 : _b.alertFiltering;
    const easSettings = (_d = (_c = settings) == null ? void 0 : _c.global) == null ? void 0 : _d.easSettings;
    const globalSettings = (_e = settings) == null ? void 0 : _e.global;
    const sets = {};
    const bools = {};
    const megered = __spreadValues(__spreadValues(__spreadValues({}, filteringSettings), easSettings), globalSettings);
    for (const key in megered) {
      const setting = megered[key];
      if (Array.isArray(setting)) {
        sets[key] = new Set(setting.map((item) => item.toLowerCase()));
      }
      if (typeof setting === "boolean") {
        bools[key] = setting;
      }
    }
    const filtered = events2.filter((alert) => {
      var _a2, _b2, _d2, _e2;
      const originalEvent = alert;
      const props = originalEvent == null ? void 0 : originalEvent.properties;
      const ugcs = (_b2 = (_a2 = props == null ? void 0 : props.geocode) == null ? void 0 : _a2.UGC) != null ? _b2 : [];
      const _c2 = originalEvent, { performance: performance2, header } = _c2, eventWithoutPerformance = __objRest(_c2, ["performance", "header"]);
      if (bools == null ? void 0 : bools.betterEventParsing) {
        const { eventName, tags } = this.enhanceEvent(originalEvent);
        originalEvent.properties.event = eventName;
        originalEvent.properties.tags = tags;
      }
      const eventCheck = (bools == null ? void 0 : bools.useParentEvents) ? (_d2 = props.parent) == null ? void 0 : _d2.toLowerCase() : (_e2 = props.event) == null ? void 0 : _e2.toLowerCase();
      const statusCorrelation = definitions.correlations.find((c) => c.type === originalEvent.properties.action_type);
      for (const key in sets) {
        const setting = sets[key];
        if (key === "filteredEvents" && setting.size > 0 && eventCheck != null && !setting.has(eventCheck)) return false;
        if (key === "ignoredEvents" && setting.size > 0 && eventCheck != null && setting.has(eventCheck)) return false;
        if (key === "filteredICOAs" && setting.size > 0 && props.sender_icao != null && !setting.has(props.sender_icao.toLowerCase())) return false;
        if (key === "ignoredICOAs" && setting.size > 0 && props.sender_icao != null && setting.has(props.sender_icao.toLowerCase())) return false;
        if (key === "ugcFilter" && setting.size > 0 && ugcs.length > 0 && !ugcs.some((ugc) => setting.has(ugc.toLowerCase()))) return false;
        if (key === "stateFilter" && setting.size > 0 && ugcs.length > 0 && !ugcs.some((ugc) => setting.has(ugc.substring(0, 2).toLowerCase()))) return false;
        if (key === "easAlerts" && setting.size > 0 && eventCheck != null && setting.has(eventCheck) && settings2.isNWWS) {
          eas_default.generateEASAudio(props.description, alert.header);
        }
      }
      for (const key in bools) {
        const setting = bools[key];
        if (key === "checkExpired" && setting && new Date(props == null ? void 0 : props.expires).getTime() < (/* @__PURE__ */ new Date()).getTime()) return false;
      }
      originalEvent.properties.action_type = statusCorrelation ? statusCorrelation.forward : originalEvent.properties.action_type;
      originalEvent.properties.is_updated = statusCorrelation ? statusCorrelation.update == true : false;
      originalEvent.properties.is_issued = statusCorrelation ? statusCorrelation.new == true : false;
      originalEvent.properties.is_cancelled = statusCorrelation ? statusCorrelation.cancel == true : false;
      originalEvent.hash = packages.crypto.createHash("md5").update(JSON.stringify(eventWithoutPerformance)).digest("hex");
      if (props.description) {
        const detectedPhrase = definitions.cancelSignatures.find((sig) => props.description.toLowerCase().includes(sig.toLowerCase()));
        if (detectedPhrase) {
          originalEvent.properties.action_type = "Cancel";
          originalEvent.properties.is_cancelled = true;
        }
      }
      if (originalEvent.vtec) {
        const getType = originalEvent.vtec.split(`.`)[0];
        const isTestProduct = definitions.productTypes[getType] == `Test Product`;
        if (isTestProduct) {
          return false;
        }
      }
      if (bools.checkExpired && originalEvent.properties.is_cancelled == true) return false;
      cache.events.emit(`on${originalEvent.properties.parent.replace(/\s+/g, "")}`);
      return true;
    });
    if (filtered.length > 0) {
      cache.events.emit(`onAlerts`, filtered);
    }
  }
  /**
   * getHeader constructs a standardized alert header string based on provided attributes, properties, and VTEC information.
   *
   * @public
   * @static
   * @param {types.TypeAttributes} attributes 
   * @param {?types.BaseProperties} [properties] 
   * @param {?types.VTECParsed} [vtec] 
   * @returns {string} 
   */
  static getHeader(attributes, properties, vtec) {
    var _a, _b, _c, _d, _e, _f, _g;
    const parent = `ATSX`;
    const alertType = (_d = (_c = (_a = attributes == null ? void 0 : attributes.awipsType) == null ? void 0 : _a.type) != null ? _c : (_b = attributes == null ? void 0 : attributes.getAwip) == null ? void 0 : _b.prefix) != null ? _d : `XX`;
    const ugc = ((_e = properties == null ? void 0 : properties.geocode) == null ? void 0 : _e.UGC) != null ? (_f = properties == null ? void 0 : properties.geocode) == null ? void 0 : _f.UGC.join(`-`) : `000000`;
    const status = (vtec == null ? void 0 : vtec.status) || "Issued";
    const issued = (properties == null ? void 0 : properties.issued) != null ? (_g = new Date(properties == null ? void 0 : properties.issued)) == null ? void 0 : _g.toISOString().replace(/[-:]/g, "").split(".")[0] : (/* @__PURE__ */ new Date()).toISOString().replace(/[-:]/g, "").split(".")[0];
    const sender = (properties == null ? void 0 : properties.sender_icao) || `XXXX`;
    const header = `ZCZC-${parent}-${alertType}-${ugc}-${status}-${issued}-${sender}-`;
    return header;
  }
  /**
   * eventHandler routes the validated alert message to the appropriate event parser based on its type (API, CAP, VTEC, UGC, or plain text).
   *
   * @public
   * @static
   * @param {types.TypeCompiled} validated 
   * @returns {*} 
   */
  static eventHandler(validated) {
    if (validated.isApi) return api_default.event(validated);
    if (validated.isCap) return cap_default.event(validated);
    if (!validated.isCap && validated.isVtec && validated.isUGC) return vtec_default2.event(validated);
    if (!validated.isCap && !validated.isVtec && validated.isUGC) return ugc_default2.event(validated);
    if (!validated.isCap && !validated.isVtec && !validated.isUGC) return text_default2.event(validated);
  }
  /**
   * getICAO retrieves the ICAO code and corresponding office name based on VTEC tracking information, message attributes, or WMO code.
   *
   * @private
   * @static
   * @param {types.VTECParsed} vtec 
   * @param {Record<string, string>} attributes 
   * @param {(RegExpMatchArray | string | null)} WMO 
   * @returns {{ icao: any; name: any; }} 
   */
  static getICAO(vtec, attributes, WMO) {
    var _a, _b, _c;
    const icao = vtec != null ? vtec == null ? void 0 : vtec.tracking.split(`-`)[0] : (_a = attributes == null ? void 0 : attributes.cccc) != null ? _a : WMO != null ? Array.isArray(WMO) ? WMO[0] : WMO : `N/A`;
    const name = (_c = (_b = definitions.ICAO) == null ? void 0 : _b[icao]) != null ? _c : `N/A`;
    return { icao, name };
  }
  /**
   * getCorrectIssuedDate ensures the issued date is valid and falls back to the current date if not.
   *
   * @private
   * @static
   * @param {Record<string, string>} attributes 
   * @returns {*} 
   */
  static getCorrectIssuedDate(attributes) {
    const time = attributes.issue != null ? new Date(attributes.issue).toLocaleString() : (attributes == null ? void 0 : attributes.issue) != null ? new Date(attributes.issue).toLocaleString() : (/* @__PURE__ */ new Date()).toLocaleString();
    if (time == `Invalid Date`) return (/* @__PURE__ */ new Date()).toLocaleString();
    return time;
  }
  /**
   * getCorrectExpiryDate determines the correct expiration date for an alert based on VTEC information or UGC zones.
   *
   * @private
   * @static
   * @param {types.VTECParsed} vtec 
   * @param {types.UGCParsed} ugc 
   * @returns {*} 
   */
  static getCorrectExpiryDate(vtec, ugc) {
    const time = (vtec == null ? void 0 : vtec.expires) && !isNaN(new Date(vtec.expires).getTime()) ? new Date(vtec.expires).toLocaleString() : (ugc == null ? void 0 : ugc.expiry) != null ? new Date(ugc.expiry).toLocaleString() : new Date((/* @__PURE__ */ new Date()).getTime() + 1 * 60 * 60 * 1e3).toLocaleString();
    if (time == `Invalid Date`) return new Date((/* @__PURE__ */ new Date()).getTime() + 1 * 60 * 60 * 1e3).toLocaleString();
    return time;
  }
};
var events_default = EventParser;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EventParser
});
