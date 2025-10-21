var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __pow = Math.pow;
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

// src/bootstrap.ts
import * as fs from "fs";
import * as path from "path";
import * as events from "events";
import * as xmpp from "@xmpp/client";
import * as shapefile from "shapefile";
import * as xml2js from "xml2js";
import * as jobs from "croner";
import sqlite3 from "better-sqlite3";
import axios from "axios";
import crypto from "crypto";
import os from "os";
import say from "say";
import child from "child_process";

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
  { regex: /\*/g, replacement: "." },
  { regex: /\bUTC\b/g, replacement: "Coordinated Universal Time" },
  { regex: /\bGMT\b/g, replacement: "Greenwich Mean Time" },
  { regex: /\bEST\b(?!\w)/g, replacement: "Eastern Standard Time" },
  { regex: /\bEDT\b(?!\w)/g, replacement: "Eastern Daylight Time" },
  { regex: /\bCST\b(?!\w)/g, replacement: "Central Standard Time" },
  { regex: /\bCDT\b(?!\w)/g, replacement: "Central Daylight Time" },
  { regex: /\bMST\b(?!\w)/g, replacement: "Mountain Standard Time" },
  { regex: /\bMDT\b(?!\w)/g, replacement: "Mountain Daylight Time" },
  { regex: /\bPST\b(?!\w)/g, replacement: "Pacific Standard Time" },
  { regex: /\bPDT\b(?!\w)/g, replacement: "Pacific Daylight Time" },
  { regex: /\bAKST\b(?!\w)/g, replacement: "Alaska Standard Time" },
  { regex: /\bAKDT\b(?!\w)/g, replacement: "Alaska Daylight Time" },
  { regex: /\bHST\b(?!\w)/g, replacement: "Hawaii Standard Time" },
  { regex: /\bHDT\b(?!\w)/g, replacement: "Hawaii Daylight Time" },
  { regex: /\bmph\b(?!\w)/g, replacement: "miles per hour" },
  { regex: /\bkm\/h\b(?!\w)/g, replacement: "kilometers per hour" },
  { regex: /\bkmh\b(?!\w)/g, replacement: "kilometers per hour" },
  { regex: /\bkt\b(?!\w)/g, replacement: "knots" },
  { regex: /\bNE\b(?!\w)/g, replacement: "northeast" },
  { regex: /\bNW\b(?!\w)/g, replacement: "northwest" },
  { regex: /\bSE\b(?!\w)/g, replacement: "southeast" },
  { regex: /\bSW\b(?!\w)/g, replacement: "southwest" },
  { regex: /\bNM\b(?!\w)/g, replacement: "nautical miles" },
  { regex: /\bdeg\b(?!\w)/g, replacement: "degrees" },
  { regex: /\btstm\b(?!\w)/g, replacement: "thunderstorm" },
  { regex: /\bmm\b(?!\w)/g, replacement: "millimeters" },
  { regex: /\bcm\b(?!\w)/g, replacement: "centimeters" },
  { regex: /\bin.\b(?!\w)/g, replacement: "inches" },
  { regex: /\bft\b(?!\w)/g, replacement: "feet" },
  { regex: /\bmi\b(?!\w)/g, replacement: "miles" },
  { regex: /\bhr\b(?!\w)/g, replacement: "hour" },
  { regex: /\bhourly\b(?!\w)/g, replacement: "per hour" },
  { regex: /\bkg\b(?!\w)/g, replacement: "kilograms" },
  { regex: /\bg\/kg\b(?!\w)/g, replacement: "grams per kilogram" },
  { regex: /\bmb\b(?!\w)/g, replacement: "millibars" },
  { regex: /\bhPa\b(?!\w)/g, replacement: "hectopascals" },
  { regex: /\bPa\b(?!\w)/g, replacement: "pascals" },
  { regex: /\bKPa\b(?!\w)/g, replacement: "kilopascals" },
  { regex: /\bC\/hr\b(?!\w)/g, replacement: "degrees Celsius per hour" },
  { regex: /\bF\/hr\b(?!\w)/g, replacement: "degrees Fahrenheit per hour" },
  { regex: /\bC\/min\b(?!\w)/g, replacement: "degrees Celsius per minute" },
  { regex: /\bF\/min\b(?!\w)/g, replacement: "degrees Fahrenheit per minute" },
  { regex: /\bC\b(?!\w)/g, replacement: "degrees Celsius" },
  { regex: /\bF\b(?!\w)/g, replacement: "degrees Fahrenheit" }
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
  sqlite3,
  jobs,
  axios,
  crypto,
  os,
  say,
  child
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
  lastWarn: null,
  totalLocationWarns: 0,
  events: new events.EventEmitter(),
  isProcessingAudioQueue: false,
  audioQueue: [],
  currentLocations: {}
};
var settings = {
  database: path.join(process.cwd(), "shapefiles.db"),
  is_wire: true,
  journal: true,
  noaa_weather_wire_service_settings: {
    reconnection_settings: {
      enabled: true,
      interval: 60
    },
    credentials: {
      username: null,
      password: null,
      nickname: "AtmosphericX Standalone Parser"
    },
    cache: {
      enabled: false,
      max_file_size: 5,
      max_db_history: 5e3,
      directory: null
    },
    preferences: {
      cap_only: false,
      shapefile_coordinates: false
    }
  },
  national_weather_service_settings: {
    interval: 15,
    endpoint: `https://api.weather.gov/alerts/active`
  },
  global_settings: {
    parent_events_only: true,
    better_event_parsing: true,
    filtering: {
      events: [],
      filtered_icoa: [],
      ignored_icoa: [`KWNS`],
      ignored_events: [`Xx`, `Test Message`],
      ugc_filter: [],
      state_filter: [],
      check_expired: true,
      ignore_text_products: true,
      location: {
        max_distance: 100,
        unit: `miles`,
        filter: false
      }
    },
    eas_settings: {
      directory: null,
      intro_wav: null,
      festival_tts_voice: `kal_diphone`
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
    shapefile_creation: `DO NOT CLOSE THIS PROJECT UNTIL THE SHAPEFILES ARE DONE COMPLETING!
	 THIS COULD TAKE A WHILE DEPENDING ON THE SPEED OF YOUR STORAGE!!
	 IF YOU CLOSE YOUR PROJECT, THE SHAPEFILES WILL NOT BE CREATED AND YOU WILL NEED TO DELETE ${settings.database} AND RESTART TO CREATE THEM AGAIN!`,
    shapefile_creation_finished: `SHAPEFILES HAVE BEEN SUCCESSFULLY CREATED AND THE DATABASE IS READY FOR USE!`,
    not_ready: `You can NOT create another instance without shutting down the current one first, please make sure to call the stop() method first!`,
    invalid_nickname: `The nickname you provided is invalid, please provide a valid nickname to continue.`,
    eas_no_directory: `You have not set a directory for EAS audio files to be saved to, please set the 'directory' setting in the global settings to enable EAS audio generation.`,
    invalid_coordinates: `The coordinates you provided are invalid, please provide valid latitude and longitude values. Attempted: {lat}, {lon}.`,
    no_current_locations: `No current location has been set, operations will be haulted until a location is set or location filtering is disabled.`,
    disabled_location_warning: `Exceeded maximum warnings for invalid or missing lat/lon coordinates. Location filtering has been ignored until you set valid coordinates or disable location filtering.`,
    reconnect_too_fast: `The client is attempting to reconnect too fast. This may be due to network instability. Reconnection attempt has been halted for safety.`,
    dump_cache: `Found {count} cached alert files and will begin dumping them shortly...`,
    dump_cache_complete: `Completed dumping all cached alert files.`,
    eas_missing_festival: `Festival TTS engine is not installed or not found in PATH. Please install Festival to enable EAS audio generation on Linux and macOS systems.`
  }
};

// src/parsers/stanza.ts
var StanzaParser = class {
  /**
   * @function validate
   * @description
   *     Validates and parses a stanza message, extracting its attributes and metadata.
   *     Handles both raw message strings (for debug/testing) and actual stanza objects.
   *     Determines whether the message is a CAP alert, contains VTEC codes, or contains UGCs,
   *     and identifies the AWIPS product type and prefix.
   *
   * @static
   * @param {any} stanza
   *     The stanza message to validate. Can be a string, XML message object, or stanza object.
   * @param {boolean | types.StanzaAttributes} [isDebug=false]
   *     If `true` or a `StanzaAttributes` object, parses the stanza as a debug/test message
   *     instead of an XMPP stanza.
   *
   * @returns {{
   *     message: any;
   *     attributes: types.StanzaAttributes;
   *     isCap: any;
   *     isVtec: boolean;
   *     isCapDescription: any;
   *     awipsType: any;
   *     isApi: boolean;
   *     ignore: boolean;
   *     isUGC?: boolean;
   * }}
   *     An object containing the parsed stanza data:
   *       - `message`: The raw message string or XML.
   *       - `attributes`: Extracted attributes from the stanza.
   *       - `isCap`: Whether the message is a CAP alert.
   *       - `isVtec`: Whether the message contains VTEC codes.
   *       - `isCapDescription`: Whether the message contains a CAP `<areaDesc>`.
   *       - `awipsType`: The AWIPS type and prefix info.
   *       - `isApi`: Whether this message came from the API.
   *       - `ignore`: Whether the stanza should be ignored.
   *       - `isUGC` (optional): Whether the message contains UGC information.
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
   * @function getType
   * @description
   *     Determines the AWIPS product type and prefix from a stanza's attributes.
   *     Returns a default type of 'XX' if the attributes are missing or the AWIPS ID
   *     does not match any known definitions.
   *
   * @private
   * @static
   * @param {unknown} attributes
   *     The stanza attributes object, expected to conform to `types.StanzaAttributes`.
   *
   * @returns {Record<string, string>}
   *     An object containing:
   *       - `type`: The AWIPS product type (e.g., 'TOR', 'SVR') or 'XX' if unknown.
   *       - `prefix`: The AWIPS prefix associated with the type, or 'XX' if unknown.
   */
  static getType(attributes) {
    const attrs = attributes;
    if (!(attrs == null ? void 0 : attrs.awipsid)) return { type: "XX", prefix: "XX" };
    const awipsDefs = definitions.awips;
    for (const [prefix, type] of Object.entries(awipsDefs)) {
      if (attrs.awipsid.startsWith(prefix)) {
        return { type, prefix };
      }
    }
    return { type: "XX", prefix: "XX" };
  }
  /**
   * @function cache
   * @description
   *     Saves a compiled stanza message to the local cache directory.
   *     Ensures the message contains "STANZA ATTRIBUTES..." metadata and timestamps,
   *     and appends the formatted entry to both a category-specific file and a general cache file.
   *
   * @private
   * @static
   * @async
   * @param {unknown} compiled
   *     The compiled stanza data object, expected to conform to `types.StanzaCompiled`.
   *     If null or invalid, the function will return early.
   *
   * @returns {Promise<void>}
   *     Resolves when the message has been successfully written to the cache files.
   */
  static cache(compiled) {
    return __async(this, null, function* () {
      if (!compiled) return;
      const data = compiled;
      const settings2 = settings;
      const { fs: fs2, path: path2 } = packages;
      if (!data.message || !settings2.noaa_weather_wire_service_settings.cache.directory) return;
      const cacheDir = settings2.noaa_weather_wire_service_settings.cache.directory;
      if (!fs2.existsSync(cacheDir)) fs2.mkdirSync(cacheDir, { recursive: true });
      let msg = data.message.replace(/\$\$/g, "");
      if (!msg.includes("STANZA ATTRIBUTES...")) {
        msg += `
STANZA ATTRIBUTES...${JSON.stringify(data.attributes)}
ISSUED TIME...${(/* @__PURE__ */ new Date()).toISOString()}
$$
`;
      }
      data.message = msg;
      const time = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      const prefix = `category-${data.awipsPrefix}-${data.awipsType}s`;
      const suffix = `${data.isCap ? "cap" : "raw"}${data.isVtec ? "-vtec" : ""}`;
      const categoryFile = path2.join(cacheDir, `${prefix}-${suffix}.bin`);
      const cacheFile = path2.join(cacheDir, `cache-${suffix}.bin`);
      const entry = `=================================================
${time}
=================================================
${msg}`;
      yield Promise.all([
        fs2.promises.appendFile(categoryFile, entry, "utf8"),
        fs2.promises.appendFile(cacheFile, entry, "utf8")
      ]);
    });
  }
};
var stanza_default = StanzaParser;

// src/parsers/text.ts
var TextParser = class {
  /**
   * @function textProductToString
   * @description
   *     Searches a text product message for a line containing a specific value,
   *     extracts the substring immediately following that value, and optionally
   *     removes additional specified strings. Cleans up the extracted string by
   *     trimming whitespace and removing any remaining occurrences of the search
   *     value or '<' characters.
   *
   * @static
   * @param {string} message
   *     The raw text product message to search.
   * @param {string} value
   *     The string to search for within each line of the message.
   * @param {string[]} [removal=[]]
   *     Optional array of substrings to remove from the extracted result.
   *
   * @returns {string | null}
   *     The cleaned-up extracted string if found, or `null` if the value does
   *     not exist in the message.
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
   * @function textProductToPolygon
   * @description
   *     Parses a text product message to extract polygon coordinates based on
   *     LAT...LON data. Coordinates are converted to [latitude, longitude] pairs
   *     with longitude negated (assumes Western Hemisphere). If the polygon has
   *     more than two points, the first point is repeated at the end to close it.
   *
   * @static
   * @param {string} message
   *     The raw text product message containing LAT...LON coordinate data.
   *
   * @returns {[number, number][]}
   *     An array of [latitude, longitude] coordinate pairs forming the polygon.
   *     Returns an empty array if no valid coordinates are found.
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
        coordinates.push([lat, lon]);
      }
    }
    if (coordinates.length > 2) {
      coordinates.push(coordinates[0]);
    }
    return coordinates;
  }
  /**
   * @function textProductToDescription
   * @description
   *     Extracts a clean description portion from a text product message, optionally
   *     removing a handle and any extra metadata such as "STANZA ATTRIBUTES...".
   *     Also trims and normalizes whitespace.
   *
   * @static
   * @param {string} message
   *     The raw text product message to process.
   * @param {string | null} [handle=null]
   *     An optional handle string to remove from the message.
   *
   * @returns {string}
   *     The extracted description text from the message.
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
    return message.replace(/\s+/g, " ").trim().startsWith("STANZA ATTRIBUTES...") ? original : message.split("STANZA ATTRIBUTES...")[0].trim();
  }
  /**
   * @function awipTextToEvent
   * @description
   *     Maps the beginning of a message string to a known AWIPS event type based on
   *     predefined prefixes. Returns a default value if no matching prefix is found.
   *
   * @static
   * @param {string} message
   *     The message string to analyze for an AWIPS prefix.
   *
   * @returns {Record<string, string>}
   *     An object containing:
   *       - `type`: The mapped AWIPS event type (or 'XX' if not found).
   *       - `prefix`: The matched prefix (or 'XX' if not found).
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
   * @function getXmlValues
   * @description
   *     Recursively extracts specified values from a parsed XML-like object.
   *     Searches both object keys and array items for matching keys (case-insensitive)
   *     and returns the corresponding values. If multiple unique values are found for
   *     a key, an array is returned; if one value is found, it returns that value; 
   *     if none are found, returns `null`.
   *
   * @static
   * @param {any} parsed
   *     The parsed XML object, typically resulting from an XML-to-JS parser.
   * @param {string[]} valuesToExtract
   *     Array of key names to extract values for from the parsed object.
   *
   * @returns {Record<string, string | string[] | null>}
   *     An object mapping each requested key to its extracted value(s) or `null`.
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
   * @function ugcExtractor
   * @description
   *     Extracts UGC (Universal Geographic Code) information from a message.
   *     This includes parsing the header, resolving zones, calculating the expiry
   *     date, and retrieving associated location names from the database.
   *
   * @static
   * @async
   * @param {string} message
   *     The message string containing UGC data.
   *
   * @returns {Promise<types.UGCEntry | null>}
   *     Resolves with a `UGCEntry` object containing `zones`, `locations`, and
   *     `expiry` if parsing is successful; otherwise `null`.
   */
  static ugcExtractor(message) {
    return __async(this, null, function* () {
      const header = this.getHeader(message);
      if (!header) return null;
      const zones = this.getZones(header);
      if (zones.length === 0) return null;
      const expiry = this.getExpiry(message);
      const locations = yield this.getLocations(zones);
      return {
        zones,
        locations,
        expiry
      };
    });
  }
  /**
   * @function getHeader
   * @description
   *     Extracts the UGC header from a message by locating patterns defined in
   *     `ugc1` and `ugc2` regular expressions. Removes all whitespace and the
   *     trailing character from the matched header.
   *
   * @static
   * @param {string} message
   *     The message string containing a UGC header.
   *
   * @returns {string | null}
   *     The extracted UGC header as a string, or `null` if no valid header is found.
   */
  static getHeader(message) {
    const start = message.search(new RegExp(definitions.expressions.ugc1, "gimu"));
    if (start === -1) return null;
    const subMessage = message.substring(start);
    const end = subMessage.search(new RegExp(definitions.expressions.ugc2, "gimu"));
    if (end === -1) return null;
    const full = subMessage.substring(0, end).replace(/\s+/g, "").slice(0, -1);
    return full || null;
  }
  /**
   * @function getExpiry
   * @description
   *     Extracts an expiration date from a message using the UGC3 format.
   *     The function parses day, hour, and minute from the message and constructs
   *     a Date object in the current month and year. Returns `null` if no valid
   *     expiration is found.
   *
   * @static
   * @param {string} message
   *     The message string containing a UGC3-formatted expiration timestamp.
   *
   * @returns {Date | null}
   *     A JavaScript Date object representing the expiration time, or `null` if
   *     the expiration could not be parsed.
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
   * @function getLocations
   * @description
   *     Retrieves human-readable location names for an array of zone identifiers
   *     from the shapefiles database. If a zone is not found, the zone ID itself
   *     is returned. Duplicate locations are removed and the result is sorted.
   *
   * @static
   * @async
   * @param {string[]} zones
   *     An array of zone identifiers to look up in the shapefiles database.
   *
   * @returns {Promise<string[]>}
   *     A sorted array of unique location names corresponding to the given zones.
   */
  static getLocations(zones) {
    return __async(this, null, function* () {
      const locations = [];
      for (let i = 0; i < zones.length; i++) {
        const id = zones[i].trim();
        const located = yield cache.db.prepare(
          `
                SELECT location FROM shapefiles WHERE id = ?`
        ).get(id);
        located != void 0 ? locations.push(located.location) : locations.push(id);
      }
      return Array.from(new Set(locations)).sort();
    });
  }
  /**
   * @function getCoordinates
   * @description
   *     Retrieves geographic coordinates for an array of zone identifiers
   *     from the shapefiles database. Returns the coordinates of the first
   *     polygon found for any matching zone.
   *
   * @static
   * @param {string[]} zones
   *     An array of zone identifiers to look up in the shapefiles database.
   *
   * @returns {[number, number][]}
   *     An array of latitude-longitude coordinate pairs corresponding to
   *     the first polygon found for the given zones.
   */
  static getCoordinates(zones) {
    let coordinates = [];
    for (let i = 0; i < zones.length; i++) {
      const id = zones[i].trim();
      const row = cache.db.prepare(
        `SELECT geometry FROM shapefiles WHERE id = ?`
      ).get(id);
      if (row != void 0) {
        let geometry = JSON.parse(row.geometry);
        if ((geometry == null ? void 0 : geometry.type) === "Polygon") {
          coordinates.push(...geometry.coordinates[0].map((coord) => [coord[1], coord[0]]));
          break;
        }
      }
    }
    return coordinates;
  }
  /**
   * @function getZones
   * @description
   *     Parses a UGC header string and returns an array of individual zone
   *     identifiers. Handles ranges indicated with `>` and preserves the
   *     state and format prefixes.
   *
   * @static
   * @param {string} header
   *     The UGC header string containing one or more zone codes or ranges.
   *
   * @returns {string[]}
   *     An array of zone identifiers extracted from the header.
   */
  static getZones(header) {
    const ugcSplit = header.split("-");
    const zones = [];
    let state = ugcSplit[0].substring(0, 2);
    const format = ugcSplit[0].substring(2, 3);
    for (const part of ugcSplit) {
      if (/^[A-Z]/.test(part)) {
        state = part.substring(0, 2);
        if (part.includes(">")) {
          const [start, end] = part.split(">");
          const startNum = parseInt(start.substring(3), 10);
          const endNum = parseInt(end, 10);
          for (let j = startNum; j <= endNum; j++) {
            zones.push(`${state}${format}${j.toString().padStart(3, "0")}`);
          }
        } else {
          zones.push(part);
        }
        continue;
      }
      if (part.includes(">")) {
        const [start, end] = part.split(">");
        const startNum = parseInt(start, 10);
        const endNum = parseInt(end, 10);
        for (let j = startNum; j <= endNum; j++) {
          zones.push(`${state}${format}${j.toString().padStart(3, "0")}`);
        }
      } else {
        zones.push(`${state}${format}${part}`);
      }
    }
    return zones.filter((item) => item !== "");
  }
};
var ugc_default = UGCParser;

// src/parsers/vtec.ts
var VtecParser = class {
  /**
   * @function vtecExtractor
   * @description
   *     Extracts VTEC entries from a raw NWWS message string and returns
   *     structured objects containing type, tracking, event, status,
   *     WMO identifiers, and expiry date.
   *
   * @static
   * @param {string} message
   *     The raw message string potentially containing one or more VTEC codes.
   *
   * @returns {Promise<types.VtecEntry[] | null>}
   *     Resolves with an array of VTEC entry objects if any are found,
   *     otherwise resolves with `null`.
   */
  static vtecExtractor(message) {
    return __async(this, null, function* () {
      var _a;
      const matches = message.match(new RegExp(definitions.expressions.vtec, "g"));
      if (!matches) return null;
      const vtecs = [];
      for (const vtec of matches) {
        const parts = vtec.split(".");
        if (parts.length < 7) continue;
        const dates = parts[6].split("-");
        vtecs.push({
          raw: vtec,
          type: definitions.productTypes[parts[0]],
          tracking: `${parts[2]}-${parts[3]}-${parts[4]}-${parts[5]}`,
          event: `${definitions.events[parts[3]]} ${definitions.actions[parts[4]]}`,
          status: definitions.status[parts[1]],
          wmo: (_a = message.match(new RegExp(definitions.expressions.wmo, "gimu"))) != null ? _a : [],
          expires: this.parseExpiryDate(dates)
        });
      }
      return vtecs.length ? vtecs : null;
    });
  }
  /**
   * @function parseExpiryDate
   * @description
   *     Converts a NWWS VTEC/expiry timestamp string into a formatted local ISO date string
   *     with an Eastern Time offset (-04:00). Returns `Invalid Date Format` if the input
   *     is `000000T0000Z`.
   *
   * @private
   * @static
   * @param {string[]} args
   *     The arguments array where `args[1]` is expected to be the expiry timestamp
   *     in VTEC format.
   * 
   * @returns {string}
   *     The formatted expiry date string in local time with `-04:00` offset, or
   *     `Invalid Date Format` if the input is invalid.
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
   * @function event
   * @description
   *     Processes a validated stanza message, extracting VTEC and UGC entries,
   *     computing base properties, generating headers, and preparing structured
   *     event objects for downstream handling. Each extracted event is enriched
   *     with metadata, performance timing, and history information.
   *
   * @static
   * @async
   * @param {types.StanzaCompiled} validated
   *     The validated stanza object containing message text, attributes,
   *     and metadata.
   *
   * @returns {Promise<void>}
   *     This method does not return a value. It processes events and
   *     invokes `EventParser.validateEvents` to filter and emit them.
   *
   * @remarks
   *     - Splits multi-stanza messages using `$$` as a delimiter.
   *     - Extracts VTEC entries using `VtecParser.vtecExtractor`.
   *     - Extracts UGC entries using `UgcParser.ugcExtractor`.
   *     - Calls `EventParser.getBaseProperties` to compile core event properties.
   *     - Computes an EAS header using `EventParser.getHeader`.
   *     - Tracks performance timing for each processed message.
   *     - Calls `EventParser.validateEvents` to filter and emit final events.
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
              source: `vtec-parser`,
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
   * @function getTracking
   * @description
   *    Generates a unique tracking identifier for an event using the sender's ICAO
   *    and some attributes.
   *
   * @private
   * @static
   * @param {types.EventProperties} baseProperties 
   * @returns {string} 
   */
  static getTracking(baseProperties) {
    return `${baseProperties.sender_icao}-${baseProperties.attributes.ttaaii}-${baseProperties.attributes.id.slice(-4)}`;
  }
  /**
   * @function getEvent
   * @description
   *     Determines the human-readable event name from a message and AWIPS attributes.
   *     - Checks if the message contains any predefined offshore event keywords
   *       and returns the matching offshore event if found.
   *     - Otherwise, returns a formatted event type string from the provided attributes,
   *       capitalizing the first letter of each word.
   *
   * @private
   * @static
   * @param {string} message
   *     The raw message text to parse for event identification.
   * @param {Record<string, any>} attributes
   *     The AWIPS-related attributes, expected to include a `type` field.
   *
   * @returns {string}
   *     The derived event name, either the matched offshore event or a formatted
   *     attribute-based string.
   */
  static getEvent(message, attributes) {
    const offshoreEvent = Object.keys(definitions.offshore).find((event) => message.toLowerCase().includes(event.toLowerCase()));
    if (offshoreEvent != void 0) return Object.keys(definitions.offshore).find((event) => message.toLowerCase().includes(event.toLowerCase()));
    return attributes.type.split(`-`).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(` `);
  }
  /**
   * @function event
   * @description
   *     Processes a validated stanza message, extracting UGC entries and
   *     computing base properties for non-VTEC events. Each extracted event
   *     is enriched with metadata, performance timing, and history information,
   *     then filtered and emitted via `EventParser.validateEvents`.
   *
   * @static
   * @async
   * @param {types.StanzaCompiled} validated
   *     The validated stanza object containing message text, attributes,
   *     and metadata.
   *
   * @returns {Promise<void>}
   *     This method does not return a value. It processes events and
   *     invokes `EventParser.validateEvents` to filter and emit them.
   *
   * @remarks
   *     - Splits multi-stanza messages using `$$`, `ISSUED TIME...`, or
   *       `=================================================` as delimiters.
   *     - Extracts UGC entries using `UgcParser.ugcExtractor`.
   *     - Calls `EventParser.getBaseProperties` to compile core event properties.
   *     - Computes an EAS header using `EventParser.getHeader`.
   *     - Generates a human-readable event name via `this.getEvent`.
   *     - Computes a tracking string via `this.getTracking`.
   *     - Tracks performance timing for each processed message.
   *     - Calls `EventParser.validateEvents` to filter and emit final events.
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
            source: `ugc-parser`,
            tracking: this.getTracking(getBaseProperties),
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
  /**
   * @function getTracking
   * @description
   *    Generates a unique tracking identifier for an event using the sender's ICAO
   *    and some attributes.
   *
   * @private
   * @static
   * @param {types.EventProperties} baseProperties 
   * @returns {string} 
   */
  static getTracking(baseProperties) {
    return `${baseProperties.sender_icao}-${baseProperties.attributes.ttaaii}-${baseProperties.attributes.id.slice(-4)}`;
  }
  /**
   * @function getEvent
   * @description
   *     Determines the event name from a text message and its AWIPS attributes.
   *     If the message contains a known offshore event keyword, that offshore
   *     event is returned. Otherwise, the event type from the AWIPS attributes
   *     is formatted into a human-readable string with each word capitalized.
   *
   * @private
   * @static
   * @param {string} message
   *     The raw text of the message to parse for event information.
   * @param {Record<string, any>} attributes
   *     The AWIPS attributes associated with the message, typically containing
   *     the `type` property.
   *
   * @returns {string}
   *     The determined event name, either an offshore event or formatted
   *     AWIPS type.
   */
  static getEvent(message, attributes) {
    const offshoreEvent = Object.keys(definitions.offshore).find((event) => message.toLowerCase().includes(event.toLowerCase()));
    if (offshoreEvent) return Object.keys(definitions.offshore).find((event) => message.toLowerCase().includes(event.toLowerCase()));
    return attributes.type.split(`-`).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(` `);
  }
  /**
   * @function event
   * @description
   *     Processes a compiled text-based NOAA Stanza message and extracts relevant
   *     event information. Splits the message into multiple segments based on
   *     markers such as "$$", "ISSUED TIME...", or separator lines, generates
   *     base properties, headers, event names, and tracking information for
   *     each segment, then validates and emits the processed events.
   *
   * @public
   * @static
   * @async
   * @param {types.StanzaCompiled} validated
   *     The validated compiled stanza object containing the original message
   *     and its attributes.
   *
   * @returns {Promise<void>}
   *     Resolves after all segments of the message have been processed and
   *     events have been validated and emitted.
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
        const getBaseProperties = yield events_default.getBaseProperties(message, validated);
        const getHeader = events_default.getHeader(__spreadValues(__spreadValues({}, validated.attributes), getBaseProperties.attributes), getBaseProperties);
        const getEvent = this.getEvent(message, getBaseProperties.attributes.getAwip);
        processed.push({
          performance: performance.now() - tick,
          source: `text-parser`,
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
  /**
   * @function getTracking
   * @description
   *   Generates a unique tracking identifier for a CAP alert based on extracted XML values.
   *   If VTEC information is available, it constructs the tracking ID from the VTEC components.
   *   Otherwise, it uses the WMO identifier along with TTAI and CCCC attributes.
   *
   * @private
   * @static
   * @param {Record<string, string>} extracted 
   * @returns {string} 
   */
  static getTracking(extracted, attributes) {
    return extracted.vtec ? (() => {
      const vtecValue = Array.isArray(extracted.vtec) ? extracted.vtec[0] : extracted.vtec;
      const splitVTEC = vtecValue.split(".");
      return `${splitVTEC[2]}-${splitVTEC[3]}-${splitVTEC[4]}-${splitVTEC[5]}`;
    })() : `${extracted.wmoidentifier.substring(extracted.wmoidentifier.length - 4)}-${attributes.ttaaii}-${attributes.id.slice(-4)}`;
  }
  /**
   * @function event
   * @description
   *    Processes validated CAP alert messages, extracting relevant information and compiling it into structured event objects.   
   *
   * @public
   * @static
   * @async
   * @param {types.StanzaCompiled} validated 
   * @returns {*} 
   */
  static event(validated) {
    return __async(this, null, function* () {
      var _a;
      let processed = [];
      const messages = (_a = validated.message.match(/<\?xml[\s\S]*?ISSUED TIME.../g)) == null ? void 0 : _a.map((msg) => msg.trim());
      if (messages == null || messages.length === 0) return;
      for (let message of messages) {
        const tick = performance.now();
        const attributes = text_default.textProductToString(message, `STANZA ATTRIBUTES...`) ? JSON.parse(text_default.textProductToString(message, `STANZA ATTRIBUTES...`)) : null;
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
          source: `cap-parser`,
          tracking: this.getTracking(extracted, attributes),
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
                const [lat, lon] = coord.split(`,`).map((num) => parseFloat(num));
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
  /**
   * @function getTracking
   * @description
   *   Generates a unique tracking identifier for a CAP alert based on extracted XML values.
   *   If VTEC information is available, it constructs the tracking ID from the VTEC components.
   *   Otherwise, it uses the WMO identifier along with TTAI and CCCC attributes.
   *
   * @private
   * @static
   * @param {Record<string, string>} extracted 
   * @returns {string} 
   */
  static getTracking(extracted, attributes) {
    return extracted.vtec ? (() => {
      const vtecValue = Array.isArray(extracted.vtec) ? extracted.vtec[0] : extracted.vtec;
      const splitVTEC = vtecValue.split(".");
      return `${splitVTEC[2]}-${splitVTEC[3]}-${splitVTEC[4]}-${splitVTEC[5]}`;
    })() : `${extracted.wmoidentifier}`;
  }
  /**
   * @function getICAO
   * @description
   *    Extracts the sender's ICAO code and corresponding name from a VTEC string.    
   *
   * @private
   * @static
   * @param {string} vtec 
   * @returns {{ icao: any; name: any; }} 
   */
  static getICAO(vtec) {
    var _a, _b;
    const icao = vtec ? vtec.split(`.`)[2] : `N/A`;
    const name = (_b = (_a = definitions.ICAO) == null ? void 0 : _a[icao]) != null ? _b : `N/A`;
    return { icao, name };
  }
  /**
   * @function event
   * @description
   *   Processes validated API alert messages, extracting relevant information and compiling it into structured event objects.
   *
   * @public
   * @static
   * @async
   * @param {types.StanzaCompiled} validated 
   * @returns {*} 
   */
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
          source: `api-parser`,
          tracking: this.getTracking({ vtec: getVTEC, wmoidentifier: getWmo, ugc: getUgc ? getUgc.join(`,`) : null }, validated.attributes),
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
                const [lat, lon] = Array.isArray(coord) ? coord : [0, 0];
                return [lon, lat];
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

// src/parsers/events.ts
var EventParser = class {
  /**
   * @function getBaseProperties
   * @description
   *     Extracts and compiles the core properties of a weather
   *     alert message into a structured object. Combines parsed
   *     textual data, UGC information, VTEC entries, and additional
   *     metadata for downstream use.
   *
   * @static
   * @async
   * @param {string} message
   *     The raw text of the weather alert or CAP/TEXT product.
   *
   * @param {types.StanzaCompiled} validated
   *     The validated stanza object containing attributes,
   *     flags, and metadata.
   *
   * @param {types.UGCEntry} [ugc=null]
   *     Optional UGC entry object providing zones, locations, and
   *     expiry information.
   *
   * @param {types.VtecEntry} [vtec=null]
   *     Optional VTEC entry object for extracting tracking,
   *     type, and expiration information.
   *
   * @returns {Promise<Record<string, any>>}
   *     A promise resolving to a fully structured object with:
   *     - locations: string of all UGC locations.
   *     - issued: ISO string of the issued timestamp.
   *     - expires: ISO string of the expiry timestamp.
   *     - geocode: Object with UGC zone identifiers.
   *     - description: Parsed description of the alert.
   *     - sender_name: Name of issuing office.
   *     - sender_icao: ICAO code of issuing office.
   *     - attributes: Combined stanza attributes with AWIP info.
   *     - parameters: Extracted hazard parameters (tornado, hail, wind, flood, etc.).
   *     - geometry: Polygon coordinates if available or derived from shapefiles.
   *
   * @remarks
   *     - Falls back to shapefile coordinates if no polygon is in the message
   *       and shapefile preferences are enabled.
   *     - Uses multiple helper methods including:
   *       - `TextParser.textProductToString`
   *       - `TextParser.textProductToPolygon`
   *       - `TextParser.textProductToDescription`
   *       - `this.getICAO`
   *       - `this.getCorrectIssuedDate`
   *       - `this.getCorrectExpiryDate`
   *       - `TextParser.awipTextToEvent`
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
      if (settings2.noaa_weather_wire_service_settings.preferences.shapefile_coordinates && base.geometry == null && ugc != null) {
        const coordinates = yield ugc_default.getCoordinates(ugc.zones);
        base.geometry = { type: "Polygon", coordinates };
      }
      return base;
    });
  }
  /**
   * @function betterParsedEventName
   * @description
   *     Enhances the parsing of an event name using additional criteria
   *     from its description and parameters. Can optionally use
   *     the original parent event name instead.
   *
   * @static
   * @param {types.EventCompiled} event
   *     The event object containing properties such as `event`,
   *     `description`, and `parameters` to analyze for better parsing.
   *
   * @param {boolean} [betterParsing=false]
   *     Whether to attempt enhanced parsing using `enhancedEvents` definitions.
   *
   * @param {boolean} [useParentEvents=false]
   *     If true, returns the original parent event name instead of
   *     the parsed/enhanced name.
   *
   * @returns {string}
   *     Returns the improved or original event name based on the
   *     parsing rules and flags.
   *
   * @remarks
   *     - Uses `loader.definitions.enhancedEvents` to map base events to
   *       more specific event names depending on conditions.
   *     - Appends `(TPROB)` for certain Severe Thunderstorm Warning events
   *       if `damage_threat` indicates a possible tornado.
   */
  static betterParsedEventName(event, betterParsing, useParentEvents) {
    var _a, _b, _c, _d, _e, _f;
    let eventName = (_b = (_a = event == null ? void 0 : event.properties) == null ? void 0 : _a.event) != null ? _b : `Unknown Event`;
    const defEventTable = definitions.enhancedEvents;
    const properties = event == null ? void 0 : event.properties;
    const parameters = properties == null ? void 0 : properties.parameters;
    const description = (_c = properties == null ? void 0 : properties.description) != null ? _c : `Unknown Description`;
    const damageThreatTag = (_d = parameters == null ? void 0 : parameters.damage_threat) != null ? _d : `N/A`;
    const tornadoThreatTag = (_e = parameters == null ? void 0 : parameters.tornado_detection) != null ? _e : `N/A`;
    if (!betterParsing) {
      return eventName;
    }
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
    return useParentEvents ? (_f = event == null ? void 0 : event.properties) == null ? void 0 : _f.event : eventName;
  }
  /**
   * @function validateEvents
   * @description
   *     Processes an array of event objects and filters them based on
   *     global and EAS filtering settings, location constraints, and
   *     other criteria such as expired or test products. Valid events
   *     trigger relevant event emitters.
   *
   * @static
   * @param {unknown[]} events
   *     An array of events to validate and filter. Each event is
   *     expected to conform to the internal structure of a compiled alert.
   *
   * @returns {void}
   *     This function does not return a value. Valid and filtered events
   *     are emitted via the event system (`loader.cache.events`).
   *
   * @remarks
   *     - Events are augmented with default signatures and computed
   *       distances before filtering.
   *     - Supports multiple filter categories, including events, ignored
   *       events, ICAO, UGC codes, and state codes.
   *     - Emits events for each valid alert, both by parent and by
   *       specific event name.
   */
  static validateEvents(events2) {
    var _a, _b, _c, _d, _e;
    if (events2.length == 0) return;
    const filteringSettings = (_b = (_a = settings) == null ? void 0 : _a.global_settings) == null ? void 0 : _b.filtering;
    const locationSettings = filteringSettings == null ? void 0 : filteringSettings.location;
    const easSettings = (_d = (_c = settings) == null ? void 0 : _c.global_settings) == null ? void 0 : _d.eas_settings;
    const globalSettings = (_e = settings) == null ? void 0 : _e.global_settings;
    const sets = {};
    const bools = {};
    const megered = __spreadValues(__spreadValues(__spreadValues(__spreadValues({}, filteringSettings), easSettings), globalSettings), locationSettings);
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
      var _a2, _b2, _d2;
      const originalEvent = this.buildDefaultSignature(alert);
      const props = originalEvent == null ? void 0 : originalEvent.properties;
      const ugcs = (_b2 = (_a2 = props == null ? void 0 : props.geocode) == null ? void 0 : _a2.UGC) != null ? _b2 : [];
      const _c2 = originalEvent, { performance: performance2, header } = _c2, eventWithoutPerformance = __objRest(_c2, ["performance", "header"]);
      originalEvent.properties.parent = originalEvent.properties.event;
      originalEvent.properties.event = this.betterParsedEventName(originalEvent, bools == null ? void 0 : bools.better_event_parsing, bools == null ? void 0 : bools.parent_events_only);
      originalEvent.hash = packages.crypto.createHash("md5").update(JSON.stringify(eventWithoutPerformance)).digest("hex");
      originalEvent.properties.distance = this.getLocationDistances(props, bools == null ? void 0 : bools.filter, locationSettings == null ? void 0 : locationSettings.max_distance, locationSettings == null ? void 0 : locationSettings.unit);
      if (!((_d2 = originalEvent.properties.distance) == null ? void 0 : _d2.in_range) && (bools == null ? void 0 : bools.filter)) {
        return false;
      }
      if (originalEvent.properties.is_test == true && (bools == null ? void 0 : bools.ignore_text_products)) return false;
      if ((bools == null ? void 0 : bools.check_expired) && originalEvent.properties.is_cancelled == true) return false;
      for (const key in sets) {
        const setting = sets[key];
        if (key === "events" && setting.size > 0 && !setting.has(originalEvent.properties.event.toLowerCase())) return false;
        if (key === "ignored_events" && setting.size > 0 && setting.has(originalEvent.properties.event.toLowerCase())) return false;
        if (key === "filtered_icoa" && setting.size > 0 && props.sender_icao != null && !setting.has(props.sender_icao.toLowerCase())) return false;
        if (key === "ignored_icoa" && setting.size > 0 && props.sender_icao != null && setting.has(props.sender_icao.toLowerCase())) return false;
        if (key === "ugc_filter" && setting.size > 0 && ugcs.length > 0 && !ugcs.some((ugc) => setting.has(ugc.toLowerCase()))) return false;
        if (key === "state_filter" && setting.size > 0 && ugcs.length > 0 && !ugcs.some((ugc) => setting.has(ugc.substring(0, 2).toLowerCase()))) return false;
      }
      cache.events.emit(`on${originalEvent.properties.parent.replace(/\s+/g, "")}`);
      cache.events.emit(`on${originalEvent.properties.event.replace(/\s+/g, "")}`);
      return true;
    });
    if (filtered.length > 0) {
      cache.events.emit(`onAlerts`, filtered);
    }
  }
  /**
   * @function getHeader
   * @description
   *     Constructs a standardized alert header string using provided
   *     stanza attributes, event properties, and optional VTEC data.
   *
   * @static
   * @param {types.StanzaAttributes} attributes
   *     The stanza attributes containing AWIPS type and related metadata.
   * @param {types.EventProperties} [properties]
   *     Optional event properties, such as geocode, issued time, and sender ICAO.
   * @param {types.VtecEntry} [vtec]
   *     Optional VTEC entry providing status information for the alert.
   *
   * @returns {string}
   *     A formatted alert header string following the ZCZC header convention.
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
   * @function eventHandler
   * @description
   *     Routes a validated stanza object to the appropriate alert handler
   *     based on its type flags: API, CAP, VTEC, UGC, or plain text.
   *
   * @static
   * @param {types.StanzaCompiled} validated
   *     The validated stanza object containing flags and message details
   *     used to determine the correct alert processing pipeline.
   *
   * @returns {void}
   */
  static eventHandler(validated) {
    if (validated.isApi) return api_default.event(validated);
    if (validated.isCap) return cap_default.event(validated);
    if (!validated.isCap && validated.isVtec && validated.isUGC) return vtec_default2.event(validated);
    if (!validated.isCap && !validated.isVtec && validated.isUGC) return ugc_default2.event(validated);
    if (!validated.isCap && !validated.isVtec && !validated.isUGC) return text_default2.event(validated);
  }
  /**
   * @function getICAO
   * @description
   *     Determines the ICAO code and corresponding name for an event.
   *     Priority is given to the VTEC tracking code, then the attributes' `cccc` property, 
   *     and finally the WMO code if available. Returns "N/A" if none are found.
   *
   * @private
   * @static
   * @param {types.VtecEntry | null} vtec
   *     The VTEC entry object, which may contain tracking information.
   * @param {Record<string, string>} attributes
   *     Event attributes object, potentially containing a `cccc` field.
   * @param {RegExpMatchArray | string | null} WMO
   *     WMO code or match array, used as a fallback if VTEC and attributes do not provide a code.
   *
   * @returns {{ icao: string; name: string }}
   *     An object containing the ICAO code and its human-readable name.
   */
  static getICAO(vtec, attributes, WMO) {
    var _a, _b, _c;
    const icao = vtec != null ? vtec == null ? void 0 : vtec.tracking.split(`-`)[0] : (_a = attributes == null ? void 0 : attributes.cccc) != null ? _a : WMO != null ? Array.isArray(WMO) ? WMO[0] : WMO : `N/A`;
    const name = (_c = (_b = definitions.ICAO) == null ? void 0 : _b[icao]) != null ? _c : `N/A`;
    return { icao, name };
  }
  /**
   * @function getCorrectIssuedDate
   * @description
   *     Determines the issued date for an event based on the provided attributes.
   *     Falls back to the current date and time if no valid issue date is available.
   *
   * @private
   * @static
   * @param {Record<string, string>} attributes
   *     The event attributes object, expected to contain an `issue` property.
   *
   * @returns {string}
   *     A locale-formatted string representing the calculated issued date and time.
   */
  static getCorrectIssuedDate(attributes) {
    const time = attributes.issue != null ? new Date(attributes.issue).toLocaleString() : (attributes == null ? void 0 : attributes.issue) != null ? new Date(attributes.issue).toLocaleString() : (/* @__PURE__ */ new Date()).toLocaleString();
    if (time == `Invalid Date`) return (/* @__PURE__ */ new Date()).toLocaleString();
    return time;
  }
  /**
   * @function getCorrectExpiryDate
   * @description
   *     Determines the most appropriate expiry date for an event using VTEC or UGC data.
   *     Falls back to one hour from the current time if no valid expiry is available.
   *
   * @private
   * @static
   * @param {types.VtecEntry} vtec
   *     The VTEC entry containing a potential `expires` date.
   * @param {types.UGCEntry} ugc
   *     The UGC entry containing a potential `expiry` date.
   *
   * @returns {string}
   *     A locale-formatted string representing the calculated expiry date and time.
   */
  static getCorrectExpiryDate(vtec, ugc) {
    const time = (vtec == null ? void 0 : vtec.expires) && !isNaN(new Date(vtec.expires).getTime()) ? new Date(vtec.expires).toLocaleString() : (ugc == null ? void 0 : ugc.expiry) != null ? new Date(ugc.expiry).toLocaleString() : new Date((/* @__PURE__ */ new Date()).getTime() + 1 * 60 * 60 * 1e3).toLocaleString();
    if (time == `Invalid Date`) return new Date((/* @__PURE__ */ new Date()).getTime() + 1 * 60 * 60 * 1e3).toLocaleString();
    return time;
  }
  /**
   * @function getLocationDistances
   * @description
   *     Calculates distances from an event's geometry to all current tracked locations.
   *     Optionally filters locations by a maximum distance.
   *
   * @private
   * @static
   * @param {types.EventProperties} [properties]
   *     Event properties object which must contain a `geometry` field with coordinates.
   *     Distances will be added to `properties.distance` keyed by location names.
   * @param {boolean} [isFiltered=false]
   *     If true, the returned `in_range` value reflects whether any location is within `maxDistance`.
   * @param {number} [maxDistance]
   *     Maximum distance to consider a location "in range" when `isFiltered` is true.
   * @param {string} [unit='miles']
   *     Unit of distance measurement: either 'miles' or 'kilometers'. Defaults to 'miles'.
   *
   * @returns {{ range?: Record<string, {unit: string, distance: number}>, in_range: boolean }}
   *     - `range`: Optional object containing distances for each location (unit + distance).
   *     - `in_range`: True if at least one location is within `maxDistance` or if no filtering is applied.
   */
  static getLocationDistances(properties, isFiltered, maxDistance, unit) {
    let inRange = false;
    const totalTracks = Object.keys(cache.currentLocations).length;
    if (properties.geometry != null) {
      for (const key in cache.currentLocations) {
        const coordinates = cache.currentLocations[key];
        const singleCoord = properties.geometry.coordinates;
        const center = singleCoord.reduce((acc, [lat, lon]) => [acc[0] + lat, acc[1] + lon], [0, 0]).map((sum) => sum / singleCoord.length);
        const validUnit = unit === "miles" || unit === "kilometers" ? unit : "miles";
        const distance = utils_default.calculateDistance({ lat: coordinates.lat, lon: coordinates.lon }, { lat: center[0], lon: center[1] }, validUnit);
        if (!properties.distance) {
          properties.distance = {};
        }
        properties.distance[key] = { unit, distance };
      }
      if (!isFiltered) {
        return { range: properties.distance, in_range: true };
      }
      for (const key in properties.distance) {
        if (properties.distance[key].distance <= maxDistance) {
          inRange = true;
        }
      }
      return { range: properties.distance, in_range: totalTracks == 0 ? true : inRange };
    }
    return { in_range: false };
  }
  /**
   * @function buildDefaultSignature
   * @description
   *     Populates default properties for an event object, including action type flags,
   *     tags, and status updates. Determines if the event is issued, updated, or cancelled
   *     based on correlations, description content, VTEC codes, and expiration time.
   *
   * @private
   * @static
   * @param {any} event
   *     The event object to process. Expected to have a `properties` object and optionally `vtec`.
   *
   * @returns {any}
   *     The event object with updated `properties`:
   *       - `is_cancelled`: True if the event is cancelled.
   *       - `is_updated`: True if the event is updated.
   *       - `is_issued`: True if the event is newly issued.
   *       - `tags`: Array of tags derived from the event description.
   *       - `is_test` (optional): True if the event is a test product.
   *       - `action_type`: Updated action type after correlation processing.
   */
  static buildDefaultSignature(event) {
    var _a, _b;
    const props = (_a = event.properties) != null ? _a : {};
    const statusCorrelation = definitions.correlations.find((c) => c.type === props.action_type);
    const defEventTags = definitions.tags;
    const tags = Object.entries(defEventTags).filter(([key]) => props == null ? void 0 : props.description.toLowerCase().includes(key.toLowerCase())).map(([, value]) => value);
    props.tags = tags.length > 0 ? tags : [`N/A`];
    const setAction = (type) => {
      props.is_cancelled = type === `C`;
      props.is_updated = type === `U`;
      props.is_issued = type === `I`;
    };
    if (statusCorrelation) {
      props.action_type = (_b = statusCorrelation.forward) != null ? _b : props.action_type;
      props.is_updated = !!statusCorrelation.update;
      props.is_issued = !!statusCorrelation.new;
      props.is_cancelled = !!statusCorrelation.cancel;
    } else {
      setAction(`I`);
    }
    if (props.description) {
      const detectedPhrase = definitions.cancelSignatures.find((sig) => props.description.toLowerCase().includes(sig.toLowerCase()));
      if (detectedPhrase) {
        setAction(`C`);
      }
    }
    if (event.vtec) {
      const getType = event.vtec.split(`.`)[0];
      const isTestProduct = definitions.productTypes[getType] == `Test Product`;
      if (isTestProduct) {
        setAction(`C`);
        props.is_test = true;
      }
    }
    if (new Date(props == null ? void 0 : props.expires).getTime() < (/* @__PURE__ */ new Date()).getTime()) {
      setAction(`C`);
    }
    return event;
  }
};
var events_default = EventParser;

// src/database.ts
var Database = class {
  /**
   * @function stanzaCacheImport
   * @description
   *     Inserts a single NWWS stanza into the database cache. If the total number
   *     of stanzas exceeds the configured maximum history, it deletes the oldest
   *     entries to maintain the limit. Duplicate stanzas are ignored.
   *
   * @static
   * @async
   * @param {string} stanza
   *     The raw stanza XML or text to store in the database.
   * 
   * @returns {Promise<void>}
   *     Resolves when the stanza has been inserted and any necessary pruning
   *     of old stanzas has been performed.
   *
   * @example
   *     await Database.stanzaCacheImport("<alert>...</alert>");
   */
  static stanzaCacheImport(stanza) {
    return __async(this, null, function* () {
      const settings2 = settings;
      try {
        const db = cache.db;
        if (!db) return;
        db.prepare(`INSERT OR IGNORE INTO stanzas (stanza) VALUES (?)`).run(stanza);
        const countRow = db.prepare(`SELECT COUNT(*) AS total FROM stanzas`).get();
        const totalRows = countRow.total;
        const maxHistory = settings2.noaa_weather_wire_service_settings.cache.max_db_history;
        if (totalRows > maxHistory) {
          const rowsToDelete = Math.floor((totalRows - maxHistory) / 2);
          if (rowsToDelete > 0) {
            db.prepare(`
                        DELETE FROM stanzas 
                        WHERE rowid IN (
                            SELECT rowid 
                            FROM stanzas 
                            ORDER BY rowid ASC 
                            LIMIT ?
                        )
                    `).run(rowsToDelete);
          }
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        utils_default.warn(`Failed to import stanza into cache: ${msg}`);
      }
    });
  }
  /**
   * @function loadDatabase
   * @description
   *     Initializes the application's SQLite database, creating necessary tables
   *     for storing stanzas and shapefiles. If the shapefiles table is empty,
   *     it imports predefined shapefiles from disk, processes their features,
   *     and populates the database. Emits warnings during the import process.
   *
   * @static
   * @async
   * @returns {Promise<void>}
   *     Resolves when the database and shapefiles have been initialized.
   *
   * @example
   *     await Database.loadDatabase();
   *     console.log('Database initialized and shapefiles imported.');
   */
  static loadDatabase() {
    return __async(this, null, function* () {
      const settings2 = settings;
      try {
        const { fs: fs2, path: path2, sqlite3: sqlite32, shapefile: shapefile2 } = packages;
        if (!fs2.existsSync(settings2.database)) fs2.writeFileSync(settings2.database, "");
        cache.db = new sqlite32(settings2.database);
        cache.db.prepare(`
                CREATE TABLE IF NOT EXISTS stanzas (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    stanza TEXT
                )
            `).run();
        cache.db.prepare(`
                CREATE TABLE IF NOT EXISTS shapefiles (
                    id TEXT PRIMARY KEY,
                    location TEXT,
                    geometry TEXT
                )
            `).run();
        const shapefileCount = cache.db.prepare(`SELECT COUNT(*) AS count FROM shapefiles`).get().count;
        if (shapefileCount === 0) {
          utils_default.warn(definitions.messages.shapefile_creation);
          for (const shape of definitions.shapefiles) {
            const filepath = path2.resolve(__dirname, "../../shapefiles", shape.file);
            const { features } = yield shapefile2.read(filepath, filepath);
            utils_default.warn(`Importing ${features.length} entries from ${shape.file}...`);
            const insertStmt = cache.db.prepare(`
                        INSERT OR REPLACE INTO shapefiles (id, location, geometry) VALUES (?, ?, ?)
                    `);
            const insertTransaction = cache.db.transaction((entries) => {
              for (const feature of entries) {
                const { properties, geometry } = feature;
                let final, location;
                if (properties.FIPS) {
                  final = `${properties.STATE}${shape.id}${properties.FIPS.substring(2)}`;
                  location = `${properties.COUNTYNAME}, ${properties.STATE}`;
                } else if (properties.FULLSTAID) {
                  final = `${properties.ST}${shape.id}${properties.WFO}`;
                  location = `${properties.CITY}, ${properties.STATE}`;
                } else if (properties.STATE) {
                  final = `${properties.STATE}${shape.id}${properties.ZONE}`;
                  location = `${properties.NAME}, ${properties.STATE}`;
                } else {
                  final = properties.ID;
                  location = properties.NAME;
                }
                insertStmt.run(final, location, JSON.stringify(geometry));
              }
            });
            insertTransaction(features);
          }
          utils_default.warn(definitions.messages.shapefile_creation_finished);
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        utils_default.warn(`Failed to load database: ${msg}`);
      }
    });
  }
};
var database_default = Database;

// src/xmpp.ts
var Xmpp = class {
  /**
   * @function isSessionReconnectionEligible
   * @description
   *     Checks if the XMPP session has been inactive longer than the given interval
   *     and, if so, attempts a controlled reconnection.
   *
   * @async
   * @static
   * @param {number} currentInterval
   *     The inactivity threshold in seconds before reconnection is triggered.
   *
   * @returns {Promise<void>}
   *     Resolves after reconnection logic completes or no action is needed.
   */
  static isSessionReconnectionEligible(currentInterval) {
    return __async(this, null, function* () {
      const settings2 = settings;
      const lastStanzaElapsed = Date.now() - cache.lastStanza;
      const threshold = currentInterval * 1e3;
      if (!cache.isConnected && !cache.sigHalt || !cache.session) {
        return;
      }
      if (lastStanzaElapsed < threshold) {
        return;
      }
      if (cache.attemptingReconnect) {
        return;
      }
      cache.attemptingReconnect = true;
      cache.isConnected = false;
      cache.totalReconnects += 1;
      try {
        cache.events.emit("onReconnection", {
          reconnects: cache.totalReconnects,
          lastStanza: lastStanzaElapsed,
          lastName: settings2.noaa_weather_wire_service_settings.credentials.nickname
        });
        yield cache.session.stop().catch(() => {
        });
        yield cache.session.start().catch(() => {
        });
      } catch (err) {
        utils_default.warn(`XMPP reconnection failed: ${err.message}`);
      } finally {
        cache.attemptingReconnect = false;
      }
    });
  }
  /**
   * @function deploySession
   * @description
   *     Initializes the NOAA Weather Wire Service (NWWS-OI) XMPP client session and
   *     manages its lifecycle events including connection, disconnection, errors,
   *     and message handling.
   *
   * @async
   * @static
   * @returns {Promise<void>}
   *     Resolves once the XMPP session has started or fails gracefully on error.
   */
  static deploySession() {
    return __async(this, null, function* () {
      var _a, _b;
      const settings2 = settings;
      (_b = (_a = settings2.noaa_weather_wire_service_settings.credentials).nickname) != null ? _b : _a.nickname = settings2.noaa_weather_wire_service_settings.credentials.username;
      cache.session = packages.xmpp.client({
        service: "xmpp://nwws-oi.weather.gov",
        domain: "nwws-oi.weather.gov",
        username: settings2.noaa_weather_wire_service_settings.credentials.username,
        password: settings2.noaa_weather_wire_service_settings.credentials.password
      });
      cache.session.on("online", (address) => __async(null, null, function* () {
        const now = Date.now();
        if (cache.lastConnect && now - cache.lastConnect < 1e4) {
          cache.sigHalt = true;
          utils_default.warn(definitions.messages.reconnect_too_fast);
          yield utils_default.sleep(2e3);
          yield cache.session.stop().catch(() => {
          });
          return;
        }
        cache.isConnected = true;
        cache.sigHalt = false;
        cache.lastConnect = now;
        cache.session.send(packages.xmpp.xml("presence", {
          to: `nwws@conference.nwws-oi.weather.gov/${settings2.noaa_weather_wire_service_settings.credentials.nickname}`,
          xmlns: "http://jabber.org/protocol/muc"
        }));
        cache.events.emit("onConnection", settings2.noaa_weather_wire_service_settings.credentials.nickname);
        if (cache.attemptingReconnect) return;
        cache.attemptingReconnect = true;
        yield utils_default.sleep(15e3);
        cache.attemptingReconnect = false;
      }));
      cache.session.on("offline", () => {
        cache.isConnected = false;
        cache.sigHalt = true;
        utils_default.warn("XMPP connection went offline");
      });
      cache.session.on("error", (error) => {
        cache.isConnected = false;
        cache.sigHalt = true;
        utils_default.warn(`XMPP connection error: ${error.message}`);
      });
      cache.session.on("stanza", (stanza) => __async(null, null, function* () {
        var _a2;
        try {
          cache.lastStanza = Date.now();
          if (stanza.is("message")) {
            const validate = stanza_default.validate(stanza);
            const skipMessage = validate.ignore || validate.isCap && !settings2.noaa_weather_wire_service_settings.preferences.cap_only || !validate.isCap && settings2.noaa_weather_wire_service_settings.preferences.cap_only || validate.isCap && !validate.isCapDescription;
            if (skipMessage) return;
            events_default.eventHandler(validate);
            database_default.stanzaCacheImport(JSON.stringify(validate));
            cache.events.emit("onMessage", validate);
          }
          if (stanza.is("presence") && ((_a2 = stanza.attrs.from) == null ? void 0 : _a2.startsWith("nwws@conference.nwws-oi.weather.gov/"))) {
            const occupant = stanza.attrs.from.split("/").slice(1).join("/");
            cache.events.emit("onOccupant", {
              occupant,
              type: stanza.attrs.type === "unavailable" ? "unavailable" : "available"
            });
          }
        } catch (err) {
          utils_default.warn(`Error processing stanza: ${err.message}`);
        }
      }));
      try {
        yield cache.session.start();
      } catch (err) {
        utils_default.warn(`Failed to start XMPP session: ${err.message}`);
      }
    });
  }
};
var xmpp_default = Xmpp;

// src/utils.ts
var Utils = class _Utils {
  /**
   * @function sleep
   * @description
   *     Pauses execution for a specified number of milliseconds.
   *
   * @static
   * @async
   * @param {number} ms
   *     The number of milliseconds to sleep.
   * @returns {Promise<void>}
   *     Resolves after the specified delay.
   */
  static sleep(ms) {
    return __async(this, null, function* () {
      return new Promise((resolve) => setTimeout(resolve, ms));
    });
  }
  /**
   * @function warn
   * @description
   *     Emits a log event and prints a warning to the console. Throttles repeated
   *     warnings within a short interval unless `force` is `true`.
   *
   * @static
   * @param {string} message
   *     The warning message to log and display.
   * @param {boolean} [force=false]
   *     If `true`, bypasses throttling and forces the warning to be displayed.
   */
  static warn(message, force = false) {
    cache.events.emit("log", message);
    if (!settings.journal) return;
    if (cache.lastWarn != null && Date.now() - cache.lastWarn < 500 && !force) return;
    cache.lastWarn = Date.now();
    console.warn(`\x1B[33m[ATMOSX-PARSER]\x1B[0m [${(/* @__PURE__ */ new Date()).toLocaleString()}] ${message}`);
  }
  /**
   * @function loadCollectionCache
   * @description
   *     Loads cached NWWS messages from disk, validates them, and passes them
   *     to the event parser. Honors CAP preferences and ignores empty or
   *     incompatible files.
   *
   * @static
   * @async
   */
  static loadCollectionCache() {
    return __async(this, null, function* () {
      try {
        const settings2 = settings;
        if (settings2.noaa_weather_wire_service_settings.cache.enabled && settings2.noaa_weather_wire_service_settings.cache.directory) {
          if (!packages.fs.existsSync(settings2.noaa_weather_wire_service_settings.cache.directory)) return;
          const cacheDir = settings2.noaa_weather_wire_service_settings.cache.directory;
          const getAllFiles = packages.fs.readdirSync(cacheDir).filter((file) => file.endsWith(".bin") && file.startsWith("cache-"));
          this.warn(definitions.messages.dump_cache.replace(`{count}`, getAllFiles.length.toString()), true);
          yield this.sleep(2e3);
          for (const file of getAllFiles) {
            const filepath = packages.path.join(cacheDir, file);
            const readFile = packages.fs.readFileSync(filepath, { encoding: "utf-8" });
            const readSize = packages.fs.statSync(filepath).size;
            if (readSize == 0) {
              continue;
            }
            const isCap = readFile.includes(`<?xml`);
            if (isCap && !settings2.noaa_weather_wire_service_settings.preferences.cap_only) continue;
            if (!isCap && settings2.noaa_weather_wire_service_settings.preferences.cap_only) continue;
            const validate = stanza_default.validate(readFile, { awipsid: file, isCap, raw: true, issue: void 0 });
            yield events_default.eventHandler(validate);
          }
          this.warn(definitions.messages.dump_cache_complete, true);
        }
      } catch (error) {
        _Utils.warn(`Failed to load cache: ${error.message}`);
      }
    });
  }
  /**
   * @function loadGeoJsonData
   * @description
   *     Fetches GeoJSON data from the National Weather Service endpoint and
   *     passes it to the event parser for processing.
   *
   * @static
   * @async
   */
  static loadGeoJsonData() {
    return __async(this, null, function* () {
      try {
        const settings2 = settings;
        const response = yield this.createHttpRequest(
          settings2.national_weather_service_settings.endpoint
        );
        if (response.error) return;
        events_default.eventHandler({
          message: JSON.stringify(response.message),
          attributes: {},
          isCap: true,
          isApi: true,
          isVtec: false,
          isUGC: false,
          isCapDescription: false,
          awipsType: { type: "api", prefix: "AP" },
          ignore: false
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        _Utils.warn(`Failed to load National Weather Service GeoJSON Data: ${msg}`);
      }
    });
  }
  /**
   * @function createHttpRequest
   * @description
   *     Performs an HTTP GET request with default headers and timeout, returning
   *     either the response data or an error message.
   *
   * @static
   * @template T
   * @param {string} url
   *     The URL to send the GET request to.
   * @param {types.HTTPSettings} [options]
   *     Optional HTTP settings to override defaults such as headers and timeout.
   *
   * @returns {Promise<{ error: boolean; message: T | string }>}
   *     Resolves with an object containing `error` status and either the
   *     response data (`message`) or an error message string.
   */
  static createHttpRequest(url, options) {
    return __async(this, null, function* () {
      var _a;
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
        const msg = err instanceof Error ? err.message : String(err);
        return { error: true, message: msg };
      }
    });
  }
  /**
   * @function garbageCollectionCache
   * @description
   *     Deletes cache files exceeding the specified size limit to free disk space.
   *     Recursively traverses the cache directory and removes files larger than
   *     the given maximum.
   *
   * @static
   * @param {number} maxFileMegabytes
   *     Maximum allowed file size in megabytes. Files exceeding this limit
   *     will be deleted.
   */
  static garbageCollectionCache(maxFileMegabytes) {
    try {
      const settings2 = settings;
      const cacheDir = settings2.noaa_weather_wire_service_settings.cache.directory;
      if (!cacheDir) return;
      const { fs: fs2, path: path2 } = packages;
      if (!fs2.existsSync(cacheDir)) return;
      const maxBytes = maxFileMegabytes * 1024 * 1024;
      const stackDirs = [cacheDir];
      const files = [];
      while (stackDirs.length) {
        const currentDir = stackDirs.pop();
        fs2.readdirSync(currentDir).forEach((file) => {
          const fullPath = path2.join(currentDir, file);
          const stat = fs2.statSync(fullPath);
          if (stat.isDirectory()) stackDirs.push(fullPath);
          else files.push({ file: fullPath, size: stat.size });
        });
      }
      files.forEach((f) => {
        if (f.size > maxBytes) fs2.unlinkSync(f.file);
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      _Utils.warn(`Failed to perform garbage collection: ${msg}`);
    }
  }
  /**
   * @function handleCronJob
   * @description
   *     Performs scheduled tasks for NWWS XMPP session maintenance or GeoJSON data
   *     updates depending on the job type.
   *
   * @static
   * @param {boolean} isWire
   *     If `true`, executes NWWS-related maintenance tasks such as cache cleanup
   *     and reconnection checks. If `false`, loads GeoJSON data.
   */
  static handleCronJob(isWire) {
    try {
      const settings2 = settings;
      const cache2 = settings2.noaa_weather_wire_service_settings.cache;
      const reconnections = settings2.noaa_weather_wire_service_settings.reconnection_settings;
      if (isWire) {
        if (cache2.enabled) {
          void this.garbageCollectionCache(cache2.max_file_size);
        }
        if (reconnections.enabled) {
          void xmpp_default.isSessionReconnectionEligible(reconnections.interval);
        }
      } else {
        void this.loadGeoJsonData();
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      _Utils.warn(`Failed to perform scheduled tasks (${isWire ? "NWWS" : "GeoJSON"}): ${msg}`);
    }
  }
  /**
   * @function mergeClientSettings
   * @description
   *     Recursively merges a ClientSettings object into a target object,
   *     preserving nested structures and overriding existing values.
   *
   * @static
   * @param {Record<string, unknown>} target
   *     The target object to merge settings into.
   * @param {types.ClientSettingsTypes} settings
   *     The settings object containing values to merge.
   *
   * @returns {Record<string, unknown>}
   *     The updated target object with merged settings.
   */
  static mergeClientSettings(target, settings2) {
    for (const key in settings2) {
      if (!Object.prototype.hasOwnProperty.call(settings2, key)) continue;
      const value = settings2[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        if (!target[key] || typeof target[key] !== "object" || Array.isArray(target[key])) {
          target[key] = {};
        }
        this.mergeClientSettings(target[key], value);
      } else {
        target[key] = value;
      }
    }
    return target;
  }
  /**
   * @function calculateDistance
   * @description
   *     Calculates the great-circle distance between two geographic coordinates
   *     using the haversine formula.
   *
   * @static
   * @param {types.Coordinates} coord1
   *     The first coordinate, containing `lat` and `lon` properties.
   * @param {types.Coordinates} coord2
   *     The second coordinate, containing `lat` and `lon` properties.
   * @param {'miles' | 'kilometers'} [unit='miles']
   *     The distance unit to return.
   *
   * @returns {number}
   *     The computed distance between the two points, rounded to two decimals.
   */
  static calculateDistance(coord1, coord2, unit = "miles") {
    if (!coord1 || !coord2) return 0;
    const { lat: lat1, lon: lon1 } = coord1;
    const { lat: lat2, lon: lon2 } = coord2;
    if ([lat1, lon1, lat2, lon2].some((v) => typeof v !== "number")) return 0;
    const toRad = (deg) => deg * Math.PI / 180;
    const R = unit === "miles" ? 3958.8 : 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = __pow(Math.sin(dLat / 2), 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * __pow(Math.sin(dLon / 2), 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }
  /**
   * @function isReadyToProcess
   * @description
   *     Determines whether processing can continue based on the current
   *     tracked locations and filter state. Emits limited warnings if no
   *     locations are available.
   *
   * @static
   * @param {boolean} isFiltering
   *     Whether location-based filtering is currently active.
   *
   * @returns {boolean}
   *     `true` if processing should proceed, otherwise `false`.
   */
  static isReadyToProcess(isFiltering) {
    const totalTracks = Object.keys(cache.currentLocations).length;
    if (totalTracks > 0) {
      cache.totalLocationWarns = 0;
      return true;
    }
    if (!isFiltering) return true;
    if (cache.totalLocationWarns < 3) {
      _Utils.warn(definitions.messages.no_current_locations);
      cache.totalLocationWarns++;
      return false;
    }
    _Utils.warn(definitions.messages.disabled_location_warning, true);
    return true;
  }
};
var utils_default = Utils;

// src/eas.ts
var EAS = class {
  /**
   * @function generateEASAudio
   * @description
   *     Generates an EAS (Emergency Alert System) audio file for a given message
   *     and SAME/VTEC code. The audio is composed of optional intro tones, SAME
   *     headers, attention tones, TTS narration of the message, and repeated
   *     SAME headers. The resulting audio is processed for NWR-style broadcast
   *     quality and saved as a WAV file.
   *
   * @static
   * @async
   * @param {string} message
   *     The text message to be converted into EAS TTS audio.
   * @param {string} vtec
   *     The SAME/VTEC code used for generating SAME headers.
   *
   * @returns {Promise<string | null>}
   *     Resolves with the path to the generated WAV file, or `null` if generation fails.
   *
   * @example
   *     const outputFile = await EAS.generateEASAudio(
   *         "Severe Thunderstorm Warning in effect for your area.",
   *         "TO.WSW.KXYZ.SV.W.0001.230102T1234Z-230102T1300Z"
   *     );
   *     console.log(`EAS audio saved to: ${outputFile}`);
   */
  static generateEASAudio(message, vtec) {
    return new Promise((resolve) => __async(this, null, function* () {
      const settings2 = settings;
      const assetsDir = settings2.global_settings.eas_settings.directory;
      const rngFile = `${vtec.replace(/[^a-zA-Z0-9]/g, `_`)}`.substring(0, 32).replace(/^_+|_+$/g, "");
      const os2 = packages.os.platform();
      for (const { regex, replacement } of definitions.messageSignatures) {
        message = message.replace(regex, replacement);
      }
      if (!assetsDir) {
        utils_default.warn(definitions.messages.eas_no_directory);
        return resolve(null);
      }
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
      if (os2 === "win32") {
        packages.say.export(message, voice, 1, tmpTTS);
      }
      yield utils_default.sleep(3500);
      let ttsBuffer = null;
      while (!packages.fs.existsSync(tmpTTS) || (ttsBuffer = packages.fs.readFileSync(tmpTTS)).length === 0) {
        yield utils_default.sleep(500);
      }
      const ttsWav = this.parseWavPCM16(ttsBuffer);
      const ttsSamples = this.resamplePCM16(ttsWav.samples, ttsWav.sampleRate, 8e3);
      const ttsRadio = this.applyNWREffect(ttsSamples, 8e3);
      let toneRadio = null;
      if (packages.fs.existsSync(settings2.global_settings.eas_settings.intro_wav)) {
        const toneBuffer = packages.fs.readFileSync(settings2.global_settings.eas_settings.intro_wav);
        const toneWav = this.parseWavPCM16(toneBuffer);
        if (toneWav == null) {
          console.log(`[EAS] Intro tone WAV file is not valid PCM 16-bit format.`);
          return resolve(null);
        }
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
      return resolve(outTTS);
    }));
  }
  /**
   * @function encodeWavPCM16
   * @description
   *     Encodes an array of 16-bit PCM samples into a standard WAV file buffer.
   *     Produces mono audio with 16 bits per sample and a specified sample rate.
   *
   *     The input `samples` array should be an array of objects containing a
   *     numeric `value` property representing the PCM sample.
   *
   * @private
   * @static
   * @param {Record<string, number>[]} samples
   *     An array of objects each containing a numeric `value` representing a
   *     16-bit PCM audio sample.
   * @param {number} [sampleRate=8000]
   *     The audio sample rate in Hz. Defaults to 8000 Hz.
   *
   * @returns {Buffer}
   *     A Node.js Buffer containing the WAV file bytes.
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
   * @function parseWavPCM16
   * @description
   *     Parses a WAV buffer containing 16-bit PCM mono audio and extracts
   *     the sample data along with format information.
   *
   *     Only supports PCM format (audioFormat = 1), 16 bits per sample,
   *     and single-channel (mono) audio. Returns `null` if the buffer
   *     is invalid or does not meet these requirements.
   *
   * @private
   * @static
   * @param {Buffer} buffer
   *     The WAV file data to parse.
   *
   * @returns { { samples: Int16Array; sampleRate: number; channels: number; bitsPerSample: number } | null }
   *     Returns an object with the extracted audio samples and format
   *     information, or `null` if parsing fails or format is unsupported.
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
   * @function concatPCM16
   * @description
   *     Concatenates multiple Int16Array PCM audio buffers into a single
   *     contiguous Int16Array.
   *
   * @private
   * @static
   * @param {Int16Array[]} arrays
   *     An array of Int16Array buffers to concatenate.
   *
   * @returns {Int16Array}
   *     A single Int16Array containing all input buffers in sequence.
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
   * @function pcm16toFloat
   * @description
   *     Converts a PCM16 Int16Array audio buffer to a Float32Array
   *     with normalized values in the range [-1, 1).
   *
   * @private
   * @static
   * @param {Int16Array} int16
   *     The input PCM16 Int16Array buffer.
   *
   * @returns {Float32Array}
   *     A Float32Array containing normalized audio samples.
   */
  static pcm16toFloat(int16) {
    const out = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) out[i] = int16[i] / 32768;
    return out;
  }
  /**
   * @function floatToPcm16
   * @description
   *     Converts a Float32Array of audio samples in the range [-1, 1]
   *     to a PCM16 Int16Array.
   *
   * @private
   * @static
   * @param {Float32Array} float32
   *     The input Float32Array containing normalized audio samples.
   *
   * @returns {Int16Array}
   *     A PCM16 Int16Array with values scaled to the [-32767, 32767] range.
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
   * @function resamplePCM16
   * @description
   *     Resamples a PCM16 audio buffer from an original sample rate to a
   *     target sample rate using linear interpolation.
   *
   * @private
   * @static
   * @param {Int16Array} int16
   *     The original PCM16 audio buffer to resample.
   * @param {number} originalRate
   *     The sample rate (in Hz) of the original audio buffer.
   * @param {number} targetRate
   *     The desired sample rate (in Hz) for the output buffer.
   *
   * @returns {Int16Array}
   *     A new PCM16 buffer resampled to the target sample rate.
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
   * @function generateSilence
   * @description
   *     Generates a PCM16 audio buffer containing silence for a specified
   *     duration.
   *
   * @private
   * @static
   * @param {number} ms
   *     Duration of the silence in milliseconds.
   * @param {number} [sampleRate=8000]
   *     Sample rate in Hz for the generated PCM16 audio.
   *
   * @returns {Int16Array}
   *     A PCM16 buffer filled with zeros representing silence.
   */
  static generateSilence(ms, sampleRate = 8e3) {
    return new Int16Array(Math.floor(ms * sampleRate));
  }
  /**
   * @function generateAttentionTone
   * @description
   *     Generates a dual-frequency Attention Tone (853 Hz and 960 Hz) used in
   *     EAS/SAME alerts. Produces a PCM16 buffer of the specified duration.
   *
   * @private
   * @static
   * @param {number} ms
   *     Duration of the tone in milliseconds.
   * @param {number} [sampleRate=8000]
   *     Sample rate in Hz for the generated PCM16 audio.
   *
   * @returns {Int16Array}
   *     A PCM16 buffer containing the generated Attention Tone.
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
   * @function applyNWREffect
   * @description
   *     Applies a National Weather Radio (NWR)-style audio effect to a PCM16
   *     buffer, including high-pass and low-pass filtering, soft clipping
   *     compression, and optional bit reduction to simulate vintage broadcast
   *     characteristics.
   *
   * @private
   * @static
   * @param {Int16Array} int16
   *     The input PCM16 audio data.
   * @param {number} [sampleRate=8000]
   *     The sample rate in Hz of the input audio.
   *
   * @returns {Int16Array}
   *     A new PCM16 buffer with the NWR-style audio effect applied.
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
   * @function addNoise
   * @description
   *     Adds random noise to a PCM16 audio buffer and normalizes the signal
   *     to prevent clipping. Useful for simulating real-world signal conditions
   *     or reducing digital artifacts.
   *
   * @private
   * @static
   * @param {Int16Array} int16
   *     The input PCM16 audio data.
   * @param {number} [noiseLevel=0.02]
   *     The amplitude of noise to add (0.0–1.0 scale).
   *
   * @returns {Int16Array}
   *     A new PCM16 buffer with added noise and normalized amplitude.
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
   * @function asciiTo8N1Bits
   * @description
   *     Converts an ASCII string into a sequence of bits using the 8N1 framing
   *     convention (1 start bit, 8 data bits, 2 stop bits) commonly used in
   *     serial and EAS transmissions.
   *
   * @private
   * @static
   * @param {string} str
   *     The ASCII string to convert into a bit sequence.
   *
   * @returns {number[]}
   *     An array of 0s and 1s representing the framed bit sequence for each character.
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
   * @function generateAFSK
   * @description
   *     Converts a sequence of bits into AFSK-modulated PCM16 audio data for EAS
   *     alerts. Applies a fade-in and fade-out to reduce clicks and generates
   *     the audio at the specified sample rate.
   *
   * @private
   * @static
   * @param {number[]} bits
   *     Array of 0 and 1 representing the bit sequence to encode.
   * @param {number} [sampleRate=8000]
   *     Sample rate in Hz for the generated audio.
   *
   * @returns {Int16Array}
   *     The PCM16 audio data representing the AFSK-modulated bit sequence.
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
   * @function generateSAMEHeader
   * @description
   *     Generates a SAME (Specific Area Message Encoding) audio header for
   *     EAS alerts. Converts a VTEC string into AFSK-modulated PCM16 audio,
   *     optionally repeating the signal with pre-mark and gap intervals.
   *
   * @private
   * @static
   * @param {string} vtec
   *     The VTEC code string to encode into the SAME header.
   * @param {number} repeats
   *     Number of times to repeat the SAME burst sequence.
   * @param {number} [sampleRate=8000]
   *     Sample rate in Hz for the generated audio.
   * @param {{preMarkSec?: number, gapSec?: number}} [options={}]
   *     Optional timing adjustments:
   *       - preMarkSec: Duration of the pre-mark tone before the data (seconds).
   *       - gapSec: Silence gap between bursts (seconds).
   *
   * @returns {Int16Array}
   *     The concatenated PCM16 audio data representing the SAME header.
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

// src/index.ts
var AlertManager = class {
  constructor(metadata) {
    this.start(metadata);
  }
  /**
   * @function setDisplayName
   * @description
   *     Sets the display nickname for the NWWS XMPP session. Trims the provided
   *     name and validates it, emitting a warning if the name is empty or invalid.
   *
   * @param {string} [name]
   *     The desired display name or nickname.
   */
  setDisplayName(name) {
    const settings2 = settings;
    const trimmed = name == null ? void 0 : name.trim();
    if (!trimmed) {
      utils_default.warn(definitions.messages.invalid_nickname);
      return;
    }
    settings2.noaa_weather_wire_service_settings.credentials.nickname = trimmed;
  }
  /**
   * @function setCurrentLocation
   * @description
   *     Sets the current location with a name and geographic coordinates.
   *     Validates the coordinates before updating the cache, emitting warnings
   *     if values are missing or invalid.
   *
   * @param {string} locationName
   *     The name of the location to set.
   * @param {types.Coordinates} [coordinates]
   *     The latitude and longitude of the location.
   */
  setCurrentLocation(locationName, coordinates) {
    if (!coordinates) {
      utils_default.warn(`Coordinates not provided for location: ${locationName}`);
      return;
    }
    const { lat, lon } = coordinates;
    if (typeof lat !== "number" || typeof lon !== "number" || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      utils_default.warn(definitions.messages.invalid_coordinates.replace("{lat}", String(lat)).replace("{lon}", String(lon)));
      return;
    }
    cache.currentLocations[locationName] = coordinates;
  }
  /**
   * @function createEasAudio
   * @description
   *     Generates an EAS (Emergency Alert System) audio file using the provided
   *     description and header.
   *
   * @async
   * @param {string} description
   *     The main content of the alert to include in the audio.
   * @param {string} header
   *     The header of the alert.
   *
   * @returns {Promise<Buffer>}
   *     Resolves with a Buffer containing the generated audio data.
   */
  createEasAudio(description, header) {
    return __async(this, null, function* () {
      return yield eas_default.generateEASAudio(description, header);
    });
  }
  /**
   * @function getAllAlertTypes
   * @description
   *     Generates a list of all possible alert types by combining defined
   *     event names with action names.
   *
   * @returns {string[]}
   *     An array of strings representing all possible event-action alert types.
   */
  getAllAlertTypes() {
    const events2 = new Set(Object.values(definitions.events));
    const actions = new Set(Object.values(definitions.actions));
    return Array.from(events2).flatMap(
      (event) => Array.from(actions).map((action) => `${event} ${action}`)
    );
  }
  /**
   * @function searchStanzaDatabase
   * @description
   *     Searches the stanza database for entries containing the specified query.
   *     Escapes SQL wildcard characters and returns results in descending order
   *     by ID, up to the specified limit.
   *
   * @async
   * @param {string} query
   *     The search string to look for in the stanza content.
   * @param {number} [limit=250]
   *     Maximum number of results to return.
   *
   * @returns {Promise<any[]>}
   *     Resolves with an array of matching database rows.
   */
  searchStanzaDatabase(query, limit = 250) {
    return __async(this, null, function* () {
      const escapeLike = (s) => s.replace(/[%_]/g, "\\$&");
      const rows = yield cache.db.prepare(`SELECT * FROM stanzas WHERE stanza LIKE ? ESCAPE '\\' ORDER BY id DESC LIMIT ${limit}`).all(`%${escapeLike(query)}%`);
      return rows;
    });
  }
  /**
   * @function setSettings
   * @description
   *     Merges the provided client settings into the current configuration,
   *     preserving nested structures.
   *
   * @async
   * @param {types.ClientSettingsTypes} settings
   *     The settings to merge into the current client configuration.
   * @returns {Promise<void>}
   *     Resolves once the settings have been merged.
   */
  setSettings(settings2) {
    return __async(this, null, function* () {
      utils_default.mergeClientSettings(settings, settings2);
    });
  }
  /**
   * @function on
   * @description
   *     Registers a callback for a specific event and returns a function
   *     to unregister the listener.
   *
   * @param {string} event
   *     The name of the event to listen for.
   * @param {(...args: any[]) => void} callback
   *     The function to call when the event is emitted.
   *
   * @returns {() => void}
   *     A function that removes the registered event listener when called.
   */
  on(event, callback) {
    cache.events.on(event, callback);
    return () => cache.events.off(event, callback);
  }
  /**
   * @function start
   * @description
   *     Initializes the client with the provided settings, starts the NWWS XMPP
   *     session if applicable, loads cached messages, and sets up scheduled
   *     tasks (cron jobs) for ongoing processing.
   *
   * @async
   * @param {types.ClientSettingsTypes} metadata
   *     Client settings used to configure session, caching, and filtering behavior.
   * @returns {Promise<void>}
   *     Resolves once initialization and scheduling are complete.
   */
  start(metadata) {
    return __async(this, null, function* () {
      var _a, _b;
      if (!cache.isReady) {
        utils_default.warn(definitions.messages.not_ready);
        return;
      }
      this.setSettings(metadata);
      const settings2 = settings;
      this.isNoaaWeatherWireService = settings2.is_wire;
      cache.isReady = false;
      while (!utils_default.isReadyToProcess((_b = (_a = settings2.global_settings.filtering.location) == null ? void 0 : _a.filter) != null ? _b : false)) {
        yield utils_default.sleep(2e3);
      }
      if (this.isNoaaWeatherWireService) {
        try {
          yield database_default.loadDatabase();
          yield xmpp_default.deploySession();
          yield utils_default.loadCollectionCache();
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          utils_default.warn(`Failed to initialize NWWS services: ${msg}`);
        }
      }
      utils_default.handleCronJob(this.isNoaaWeatherWireService);
      if (this.job) {
        try {
          this.job.stop();
        } catch (e) {
          utils_default.warn(`Failed to stop existing cron job.`);
        }
        this.job = null;
      }
      const interval = !this.isNoaaWeatherWireService ? settings2.national_weather_service_settings.interval : 5;
      this.job = new packages.jobs.Cron(`*/${interval} * * * * *`, () => {
        utils_default.handleCronJob(this.isNoaaWeatherWireService);
      });
    });
  }
  /**
   * @function stop
   * @description
   *     Stops active scheduled tasks (cron job) and, if connected, the NWWS
   *     XMPP session. Updates relevant cache flags to indicate the session
   *     is no longer active.
   *
   * @async
   * @returns {Promise<void>}
   *     Resolves once all tasks and the session have been stopped.
   */
  stop() {
    return __async(this, null, function* () {
      cache.isReady = true;
      if (this.job) {
        try {
          this.job.stop();
        } catch (e) {
          utils_default.warn(`Failed to stop cron job.`);
        }
        this.job = null;
      }
      const session = cache.session;
      if (session && this.isNoaaWeatherWireService) {
        try {
          yield session.stop();
        } catch (e) {
          utils_default.warn(`Failed to stop XMPP session.`);
        }
        cache.sigHalt = true;
        cache.isConnected = false;
        cache.session = null;
        this.isNoaaWeatherWireService = false;
      }
    });
  }
};
var index_default = AlertManager;
export {
  AlertManager,
  database_default as Database,
  eas_default as EAS,
  events_default as EventParser,
  stanza_default as StanzaParser,
  text_default as TextParser,
  ugc_default as UGCParser,
  utils_default as Utils,
  vtec_default as VtecParser,
  index_default as default
};
