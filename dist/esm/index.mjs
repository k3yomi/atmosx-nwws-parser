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
var CAUSES = {
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
};
var RECORDS = {
  "NO": "No Record Expected",
  "NR": "Near Record or possible record",
  "UU": "Unknown history of records",
  "OO": "Other"
};
var SEVERITY = {
  N: "Not Expected",
  0: "Areal Flood or FF Product",
  1: "Minor",
  2: "Moderate",
  3: "Major",
  U: "Unknown"
};

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
      disable_ugc: false,
      disable_vtec: false,
      disable_text: false,
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
        unit: `miles`
      }
    },
    eas_settings: {
      directory: null,
      intro_wav: null
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
  causes: CAUSES,
  records: RECORDS,
  severity: SEVERITY,
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
  regular_expressions: {
    pvtec: new RegExp(`[OTEX].(NEW|CON|EXT|EXA|EXB|UPG|CAN|EXP|COR|ROU).[A-Z]{4}.[A-Z]{2}.[WAYSFON].[0-9]{4}.[0-9]{6}T[0-9]{4}Z-[0-9]{6}T[0-9]{4}Z`, "g"),
    hvtec: new RegExp(`[a-zA-Z0-9]{4}.[A-Z0-9].[A-Z]{2}.[0-9]{6}T[0-9]{4}Z.[0-9]{6}T[0-9]{4}Z.[0-9]{6}T[0-9]{4}Z.[A-Z]{2}`, "imu"),
    wmo: new RegExp(`[A-Z0-9]{6}\\s[A-Z]{4}\\s\\d{6}`, "imu"),
    ugc1: new RegExp(`(\\w{2}[CZ](\\d{3}((-|>)\\s?(\\n\\n)?))+)`, "imu"),
    ugc2: new RegExp(`(\\d{6}(-|>)\\s?(\\n\\n)?)`, "imu"),
    ugc3: new RegExp(`(\\d{6})(?=-|$)`, "imu"),
    dateline: new RegExp(`\\d{3,4}\\s*(AM|PM)?\\s*[A-Z]{2,4}\\s+[A-Z]{3,}\\s+[A-Z]{3,}\\s+\\d{1,2}\\s+\\d{4}`, "gim")
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
   * @param {boolean | types.StanzaAttributes} [isDebug=false]
   * @returns {{
   *     message: string;
   *     attributes: types.StanzaAttributes;
   *     isCap: boolean,
   *     isPVtec: boolean;
   *     isCapDescription: boolean;
   *     awipsType: Record<string, string>;
   *     isApi: boolean;
   *     ignore: boolean;
   *     isUGC?: boolean;
   * }}
   */
  static validate(stanza, isDebug = false) {
    var _a;
    if (isDebug !== false) {
      const vTypes = isDebug;
      const message = stanza;
      const attributes = vTypes;
      const isCap = (_a = vTypes.isCap) != null ? _a : message.includes(`<?xml`);
      const isCapDescription = message.includes(`<areaDesc>`);
      const isPVtec = message.match(definitions.regular_expressions.pvtec) != null;
      const isUGC = message.match(definitions.regular_expressions.ugc1) != null;
      const awipsType = this.getType(attributes);
      return { message, attributes, isCap, isPVtec, isUGC, isCapDescription, awipsType, isApi: false, ignore: false };
    }
    if (stanza.is(`message`)) {
      let cb = stanza.getChild(`x`);
      if (cb && cb.children) {
        let message = unescape(cb.children[0]);
        let attributes = cb.attrs;
        if (attributes.awipsid && attributes.awipsid.length > 1) {
          const isCap = message.includes(`<?xml`);
          const isCapDescription = message.includes(`<areaDesc>`);
          const isPVtec = message.match(definitions.regular_expressions.pvtec) != null;
          const isUGC = message.match(definitions.regular_expressions.ugc1) != null;
          const awipsType = this.getType(attributes);
          this.cache(message, { attributes, isCap, isPVtec, awipsType });
          return { message, attributes, isCap, isPVtec, isUGC, isCapDescription, awipsType, isApi: false, ignore: false };
        }
      }
    }
    return { message: null, attributes: null, isApi: null, isCap: null, isPVtec: null, isUGC: null, isCapDescription: null, awipsType: null, ignore: true };
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
   * @returns {Record<string, string>}
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
   * @returns {Promise<void>}
   */
  static cache(message, compiled) {
    return __async(this, null, function* () {
      if (!compiled) return;
      const data = compiled;
      const settings2 = settings;
      const { fs: fs2, path: path2 } = packages;
      if (!message || !settings2.noaa_weather_wire_service_settings.cache.directory) return;
      const cacheDir = settings2.noaa_weather_wire_service_settings.cache.directory;
      if (!fs2.existsSync(cacheDir)) fs2.mkdirSync(cacheDir, { recursive: true });
      const prefix = `category-${data.awipsType.prefix}-${data.awipsType.type}s`;
      const suffix = `${data.isCap ? "cap" : "raw"}${data.isPVtec ? "-vtec" : ""}`;
      const categoryFile = path2.join(cacheDir, `${prefix}-${suffix}.bin`);
      const cacheFile = path2.join(cacheDir, `cache-${suffix}.bin`);
      const entry = `[SoF]
STANZA ATTRIBUTES...${JSON.stringify(compiled)}
[EoF]
${message}`;
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
   * @param {string} value
   * @param {string[]} [removal=[]]
   * @returns {string | null}
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
   * @param {string | null} [handle=null]
   * @returns {string}
   */
  static textProductToDescription(message, handle = null) {
    const original = message;
    const discoveredDates = Array.from(message.matchAll(definitions.regular_expressions.dateline));
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
   * @param {string[]} valuesToExtract
   * @returns {Record<string, string | string[] | null>}
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
   * @returns {Promise<types.UGCEntry | null>}
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
   * @returns {string | null}
   */
  static getHeader(message) {
    const start = message.search(definitions.regular_expressions.ugc1);
    const subMessage = message.substring(start);
    const end = subMessage.search(definitions.regular_expressions.ugc2);
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
   * @returns {Date | null}
   */
  static getExpiry(message) {
    const start = message.match(definitions.regular_expressions.ugc3);
    const day = parseInt(start[0].substring(0, 2), 10);
    const hour = parseInt(start[0].substring(2, 4), 10);
    const minute = parseInt(start[0].substring(4, 6), 10);
    const now = /* @__PURE__ */ new Date();
    const expires = new Date(now.getUTCFullYear(), now.getUTCMonth(), day, hour, minute, 0);
    return expires;
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
   * @returns {Promise<string[]>}
   */
  static getLocations(zones) {
    return __async(this, null, function* () {
      const uniqueZones = Array.from(new Set(zones.map((z) => z.trim())));
      const placeholders = uniqueZones.map(() => "?").join(",");
      const rows = yield cache.db.prepare(
        `SELECT id, location FROM shapefiles WHERE id IN (${placeholders})`
      ).all(...uniqueZones);
      const locationMap = /* @__PURE__ */ new Map();
      for (const row of rows) {
        locationMap.set(row.id, row.location);
      }
      const locations = uniqueZones.map((id) => {
        var _a;
        return (_a = locationMap.get(id)) != null ? _a : id;
      });
      return locations.sort();
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
   * @returns {[number, number][]}
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
   * @returns {string[]}
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

// src/parsers/pvtec.ts
var PVtecParser = class {
  /**
   * @function pVtecExtractor
   * @description
   *     Extracts VTEC entries from a raw NWWS message string and returns
   *     structured objects containing type, tracking, event, status,
   *     WMO identifiers, and expiry date.
   *
   * @static
   * @param {string} message
   * @returns {Promise<types.VtecEntry[] | null>}
   */
  static pVtecExtractor(message) {
    return __async(this, null, function* () {
      var _a, _b;
      const matches = (_a = message.match(definitions.regular_expressions.pvtec)) != null ? _a : [];
      const pVtecs = [];
      for (const pvtec of matches) {
        const parts = pvtec.split(".");
        if (parts.length < 7) continue;
        const dates = parts[6].split("-");
        pVtecs.push({
          raw: pvtec,
          type: definitions.productTypes[parts[0]],
          tracking: `${parts[2]}-${parts[3]}-${parts[4]}-${parts[5]}`,
          event: `${definitions.events[parts[3]]} ${definitions.actions[parts[4]]}`,
          status: definitions.status[parts[1]],
          wmo: ((_b = message.match(definitions.regular_expressions.wmo)) == null ? void 0 : _b[0]) || `N/A`,
          expires: this.parseExpiryDate(dates)
        });
      }
      return pVtecs.length > 0 ? pVtecs : null;
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
var pvtec_default = PVtecParser;

// src/parsers/hvtec.ts
var HVtecParser = class {
  /**
   * @function HVtecExtractor
   * @description
   *     Extracts VTEC entries from a raw NWWS message string and returns
   *     structured objects containing type, tracking, event, status,
   *     WMO identifiers, and expiry date.
   *
   * @static
   * @param {string} message
   * @returns {Promise<types.HtecEntry[] | null>}
   */
  static HVtecExtractor(message) {
    return __async(this, null, function* () {
      const matches = message.match(definitions.regular_expressions.hvtec);
      if (!matches || matches.length !== 1) return null;
      const hvtec = matches[0];
      const parts = hvtec.split(".");
      if (parts.length < 7) return null;
      const hvtecs = [{
        severity: definitions.severity[parts[1]],
        cause: definitions.causes[parts[2]],
        record: definitions.records[parts[6]],
        raw: hvtec
      }];
      return hvtecs;
    });
  }
};
var hvtec_default = HVtecParser;

// src/parsers/events/vtec.ts
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
   * @returns {Promise<void>}
   */
  static event(validated) {
    return __async(this, null, function* () {
      var _a, _b;
      let processed = [];
      const blocks = (_a = validated.message.split(/\[SoF\]/gim)) == null ? void 0 : _a.map((msg) => msg.trim());
      for (const block of blocks) {
        const cachedAttribute = block.match(/STANZA ATTRIBUTES\.\.\.(\{.*\})/);
        const messages = (_b = block.split(/(?=\$\$)/g)) == null ? void 0 : _b.map((msg) => msg.trim());
        if (!messages || messages.length == 0) return;
        for (let i = 0; i < messages.length; i++) {
          const tick = performance.now();
          const message = messages[i];
          const attributes = cachedAttribute != null ? JSON.parse(cachedAttribute[1]) : validated;
          const getPVTEC = yield pvtec_default.pVtecExtractor(message);
          const getHVTEC = yield hvtec_default.HVtecExtractor(message);
          const getUGC = yield ugc_default.ugcExtractor(message);
          if (getPVTEC != null && getUGC != null) {
            for (let j = 0; j < getPVTEC.length; j++) {
              const pVtec = getPVTEC[j];
              const getBaseProperties = yield events_default.getBaseProperties(message, attributes, getUGC, pVtec, getHVTEC);
              const getHeader = events_default.getHeader(__spreadValues(__spreadValues({}, validated.attributes), getBaseProperties.metadata), getBaseProperties, pVtec);
              processed.push({
                performance: performance.now() - tick,
                source: `pvtec-parser`,
                tracking: pVtec.tracking,
                header: getHeader,
                pvtec: pVtec.raw,
                hvtec: getHVTEC != null ? getHVTEC.raw : `N/A`,
                history: [{ description: getBaseProperties.description, issued: getBaseProperties.issued, type: pVtec.status }],
                properties: __spreadValues({ event: pVtec.event, parent: pVtec.event, action_type: pVtec.status }, getBaseProperties)
              });
            }
          }
        }
      }
      events_default.validateEvents(processed);
    });
  }
};
var vtec_default = VTECAlerts;

// src/parsers/events/ugc.ts
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
    return `${baseProperties.sender_icao}-${baseProperties.metadata.attributes.ttaaii}-${baseProperties.metadata.attributes.id.slice(-4)}`;
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
   * @param {Record<string, any>} attributes
   * @returns {string}
   */
  static getEvent(message, metadata) {
    const offshoreEvent = Object.keys(definitions.offshore).find((event) => message.toLowerCase().includes(event.toLowerCase()));
    if (offshoreEvent != void 0) return Object.keys(definitions.offshore).find((event) => message.toLowerCase().includes(event.toLowerCase()));
    return metadata.awipsType.type.split(`-`).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(` `);
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
   * @returns {Promise<void>}
   */
  static event(validated) {
    return __async(this, null, function* () {
      var _a, _b;
      let processed = [];
      const blocks = (_a = validated.message.split(/\[SoF\]/gim)) == null ? void 0 : _a.map((msg) => msg.trim());
      for (const block of blocks) {
        const cachedAttribute = block.match(/STANZA ATTRIBUTES\.\.\.(\{.*\})/);
        const messages = (_b = block.split(/(?=\$\$)/g)) == null ? void 0 : _b.map((msg) => msg.trim());
        if (!messages || messages.length == 0) return;
        for (let i = 0; i < messages.length; i++) {
          const tick = performance.now();
          const message = messages[i];
          const getUGC = yield ugc_default.ugcExtractor(message);
          if (getUGC != null) {
            const attributes = cachedAttribute != null ? JSON.parse(cachedAttribute[1]) : validated;
            const getBaseProperties = yield events_default.getBaseProperties(message, attributes, getUGC);
            const getHeader = events_default.getHeader(__spreadValues(__spreadValues({}, attributes), getBaseProperties.metadata), getBaseProperties);
            const getEvent = this.getEvent(message, attributes);
            processed.push({
              performance: performance.now() - tick,
              source: `ugc-parser`,
              tracking: this.getTracking(getBaseProperties),
              header: getHeader,
              pvtec: `N/A`,
              hvtec: `N/A`,
              history: [{ description: getBaseProperties.description, issued: getBaseProperties.issued, type: `Issued` }],
              properties: __spreadValues({ event: getEvent, parent: getEvent, action_type: `Issued` }, getBaseProperties)
            });
          }
        }
      }
      events_default.validateEvents(processed);
    });
  }
};
var ugc_default2 = UGCAlerts;

// src/parsers/events/text.ts
var TextAlerts = class {
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
    return `${baseProperties.sender_icao}-${baseProperties.metadata.attributes.ttaaii}-${baseProperties.metadata.attributes.id.slice(-4)}`;
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
   * @param {types.StanzaAttributes} metadata
   * @returns {string}
   */
  static getEvent(message, metadata) {
    const offshoreEvent = Object.keys(definitions.offshore).find((event) => message.toLowerCase().includes(event.toLowerCase()));
    if (offshoreEvent != void 0) return Object.keys(definitions.offshore).find((event) => message.toLowerCase().includes(event.toLowerCase()));
    return metadata.awipsType.type.split(`-`).map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(` `);
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
   * @returns {Promise<void>}
   */
  static event(validated) {
    return __async(this, null, function* () {
      var _a, _b;
      let processed = [];
      const blocks = (_a = validated.message.split(/\[SoF\]/gim)) == null ? void 0 : _a.map((msg) => msg.trim());
      for (const block of blocks) {
        const cachedAttribute = block.match(/STANZA ATTRIBUTES\.\.\.(\{.*\})/);
        const messages = (_b = block.split(/(?=\$\$)/g)) == null ? void 0 : _b.map((msg) => msg.trim());
        if (!messages || messages.length == 0) return;
        for (let i = 0; i < messages.length; i++) {
          const tick = performance.now();
          const message = messages[i];
          const attributes = cachedAttribute != null ? JSON.parse(cachedAttribute[1]) : validated;
          const getBaseProperties = yield events_default.getBaseProperties(message, attributes);
          const getHeader = events_default.getHeader(__spreadValues(__spreadValues({}, validated.attributes), getBaseProperties.metadata), getBaseProperties);
          const getEvent = this.getEvent(message, attributes);
          processed.push({
            performance: performance.now() - tick,
            source: `text-parser`,
            tracking: this.getTracking(getBaseProperties),
            header: getHeader,
            pvtec: `N/A`,
            hvtec: `N/A`,
            history: [{ description: getBaseProperties.description, issued: getBaseProperties.issued, type: `Issued` }],
            properties: __spreadValues({ event: getEvent, parent: getEvent, action_type: `Issued` }, getBaseProperties)
          });
        }
      }
      events_default.validateEvents(processed);
    });
  }
};
var text_default2 = TextAlerts;

// src/parsers/events/cap.ts
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
  static getTracking(extracted, metadata) {
    return extracted.vtec ? (() => {
      const vtecValue = Array.isArray(extracted.vtec) ? extracted.vtec[0] : extracted.vtec;
      const splitPVTEC = vtecValue.split(".");
      return `${splitPVTEC[2]}-${splitPVTEC[3]}-${splitPVTEC[4]}-${splitPVTEC[5]}`;
    })() : `${extracted.wmoidentifier.substring(extracted.wmoidentifier.length - 4)}-${metadata.attributes.ttaaii}-${metadata.attributes.id.slice(-4)}`;
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
      var _a, _b;
      let processed = [];
      const tick = performance.now();
      const blocks = (_a = validated.message.split(/\[SoF\]/gim)) == null ? void 0 : _a.map((msg) => msg.trim());
      for (const block of blocks) {
        const cachedAttribute = block.match(/STANZA ATTRIBUTES\.\.\.(\{.*\})/);
        const messages = (_b = block.split(/(?=\$\$)/g)) == null ? void 0 : _b.map((msg) => msg.trim());
        if (!messages || messages.length == 0) return;
        for (let i = 0; i < messages.length; i++) {
          let message = messages[i];
          const attributes = cachedAttribute != null ? JSON.parse(cachedAttribute[1]) : validated;
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
            pvtec: extracted.vtec || `N/A`,
            hvtec: `N/A`,
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
              attributes,
              geocode: {
                UGC: [extracted.ugc]
              },
              metadata: { attributes },
              technical: {
                vtec: extracted.vtec || `N/A`,
                ugc: extracted.ugc || `N/A`,
                hvtec: `N/A`
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
      }
      events_default.validateEvents(processed);
    });
  }
};
var cap_default = CapAlerts;

// src/parsers/events/api.ts
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
  static getTracking(extracted) {
    return extracted.pVtec ? (() => {
      const vtecValue = Array.isArray(extracted.pVtec) ? extracted.pVtec[0] : extracted.pVtec;
      const splitPVTEC = vtecValue.split(".");
      return `${splitPVTEC[2]}-${splitPVTEC[3]}-${splitPVTEC[4]}-${splitPVTEC[5]}`;
    })() : `${extracted.wmoidentifier}`;
  }
  /**
   * @function getICAO
   * @description
   *    Extracts the sender's ICAO code and corresponding name from a VTEC string.    
   *
   * @private
   * @static
   * @param {string} pVtec 
   * @returns {{ icao: any; name: any; }} 
   */
  static getICAO(pVtec) {
    var _a, _b;
    const icao = pVtec ? pVtec.split(`.`)[2] : `N/A`;
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
        const getPVTEC = (_d = (_c = (_b = (_a = feature == null ? void 0 : feature.properties) == null ? void 0 : _a.parameters) == null ? void 0 : _b.VTEC) == null ? void 0 : _c[0]) != null ? _d : null;
        const getWmo = (_g = (_f = (_e = feature == null ? void 0 : feature.properties) == null ? void 0 : _e.parameters) == null ? void 0 : _f.WMOidentifier[0]) != null ? _g : null;
        const getUgc = (_j = (_i = (_h = feature == null ? void 0 : feature.properties) == null ? void 0 : _h.geocode) == null ? void 0 : _i.UGC) != null ? _j : null;
        const getHeadline = (_n = (_m = (_l = (_k = feature == null ? void 0 : feature.properties) == null ? void 0 : _k.parameters) == null ? void 0 : _l.NWSheadline) == null ? void 0 : _m[0]) != null ? _n : "";
        const getDescription = `${getHeadline} ${(_p = (_o = feature == null ? void 0 : feature.properties) == null ? void 0 : _o.description) != null ? _p : ``}`;
        const getAWIP = (_t = (_s = (_r = (_q = feature == null ? void 0 : feature.properties) == null ? void 0 : _q.parameters) == null ? void 0 : _r.AWIPSidentifier) == null ? void 0 : _s[0]) != null ? _t : null;
        const getHeader = events_default.getHeader(__spreadValues({}, { getAwip: { prefix: getAWIP == null ? void 0 : getAWIP.slice(0, -3) } }));
        const getSource = text_default.textProductToString(getDescription, `SOURCE...`, [`.`]) || `N/A`;
        const getOffice = this.getICAO(getPVTEC || ``);
        processed.push({
          performance: performance.now() - tick,
          source: `api-parser`,
          tracking: this.getTracking({ pVtec: getPVTEC, wmoidentifier: getWmo, ugc: getUgc ? getUgc.join(`,`) : null }),
          header: getHeader,
          pvtec: getPVTEC || `N/A`,
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
            metadata: {},
            technical: {
              vtec: getPVTEC || `N/A`,
              ugc: getUgc ? getUgc.join(`,`) : `N/A`,
              hvtec: `N/A`
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
   * @param {types.StanzaCompiled} validated
   * @param {types.UGCEntry} [ugc=null]
   * @param {types.PVtecEntry} [pVtec=null]
   * @param {types.HVtecEntry} [hVtec=null]
   * @returns {Promise<Record<string, any>>}
   */
  static getBaseProperties(message, metadata, ugc = null, pVtec = null, hVtec = null) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
      const settings2 = settings;
      const definitions2 = {
        tornado: (_b = (_a = text_default.textProductToString(message, `TORNADO...`)) != null ? _a : text_default.textProductToString(message, `WATERSPOUT...`)) != null ? _b : `N/A`,
        hail: (_d = (_c = text_default.textProductToString(message, `MAX HAIL SIZE...`, [`IN`])) != null ? _c : text_default.textProductToString(message, `HAIL...`, [`IN`])) != null ? _d : `N/A`,
        gusts: (_f = (_e = text_default.textProductToString(message, `MAX WIND GUST...`)) != null ? _e : text_default.textProductToString(message, `WIND...`)) != null ? _f : `N/A`,
        flood: (_g = text_default.textProductToString(message, `FLASH FLOOD...`)) != null ? _g : `N/A`,
        damage: (_h = text_default.textProductToString(message, `DAMAGE THREAT...`)) != null ? _h : `N/A`,
        source: (_i = text_default.textProductToString(message, `SOURCE...`, [`.`])) != null ? _i : `N/A`,
        polygon: text_default.textProductToPolygon(message),
        description: text_default.textProductToDescription(message, (_j = pVtec == null ? void 0 : pVtec.raw) != null ? _j : null),
        wmo: (_l = (_k = message.match(definitions.regular_expressions.wmo)) == null ? void 0 : _k[0]) != null ? _l : `N/A`,
        mdTorIntensity: (_m = text_default.textProductToString(message, `MOST PROBABLE PEAK TORNADO INTENSITY...`)) != null ? _m : `N/A`,
        mdWindGusts: (_n = text_default.textProductToString(message, `MOST PROBABLE PEAK WIND GUST...`)) != null ? _n : `N/A`,
        mdHailSize: (_o = text_default.textProductToString(message, `MOST PROBABLE PEAK HAIL SIZE...`)) != null ? _o : `N/A`
      };
      const getOffice = this.getICAO(pVtec, metadata, definitions2.wmo);
      const getCorrectIssued = this.getCorrectIssuedDate(metadata);
      const getCorrectExpiry = this.getCorrectExpiryDate(pVtec, ugc);
      const base = {
        locations: (_p = ugc == null ? void 0 : ugc.locations.join(`; `)) != null ? _p : `No Location Specified (UGC Missing)`,
        issued: getCorrectIssued,
        expires: getCorrectExpiry,
        geocode: { UGC: (_q = ugc == null ? void 0 : ugc.zones) != null ? _q : [`XX000`] },
        description: definitions2.description,
        sender_name: getOffice.name,
        sender_icao: getOffice.icao,
        metadata: __spreadValues({}, Object.fromEntries(Object.entries(metadata).filter(([key]) => key !== "message"))),
        technical: { ugc, vtec: pVtec, hvtec: hVtec },
        parameters: {
          wmo: Array.isArray(definitions2.wmo) ? definitions2.wmo[0] : (_r = definitions2.wmo) != null ? _r : `N/A`,
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
   * @param {boolean} [betterParsing=false]
   * @param {boolean} [useParentEvents=false]
   * @returns {string}
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
        if (baseEvent === "Severe Thunderstorm Warning" && tornadoThreatTag === "POSSIBLE" && !eventName.includes("(TPROB)")) eventName += " (TPROB)";
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
   * @returns {void}
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
      var _a2, _b2;
      const originalEvent = this.buildDefaultSignature(alert);
      const props = originalEvent == null ? void 0 : originalEvent.properties;
      const ugcs = (_b2 = (_a2 = props == null ? void 0 : props.geocode) == null ? void 0 : _a2.UGC) != null ? _b2 : [];
      const _c2 = originalEvent, { performance: performance2, header } = _c2, eventWithoutPerformance = __objRest(_c2, ["performance", "header"]);
      originalEvent.properties.parent = originalEvent.properties.event;
      originalEvent.properties.event = this.betterParsedEventName(originalEvent, bools == null ? void 0 : bools.better_event_parsing, bools == null ? void 0 : bools.parent_events_only);
      originalEvent.hash = packages.crypto.createHash("md5").update(JSON.stringify(eventWithoutPerformance)).digest("hex");
      originalEvent.properties.distance = this.getLocationDistances(props, locationSettings == null ? void 0 : locationSettings.unit);
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
   * @param {types.EventProperties} [properties]
   * @param {types.PVtecEntry} [pVtec]
   * @returns {string}
   */
  static getHeader(attributes, properties, pVtec) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const parent = `ATSX`;
    const alertType = (_d = (_c = (_a = attributes == null ? void 0 : attributes.awipsType) == null ? void 0 : _a.type) != null ? _c : (_b = attributes == null ? void 0 : attributes.getAwip) == null ? void 0 : _b.prefix) != null ? _d : `XX`;
    const ugc = ((_e = properties == null ? void 0 : properties.geocode) == null ? void 0 : _e.UGC) != null ? (_f = properties == null ? void 0 : properties.geocode) == null ? void 0 : _f.UGC.join(`-`) : `000000`;
    const status = (_g = pVtec == null ? void 0 : pVtec.status) != null ? _g : "Issued";
    const issued = (properties == null ? void 0 : properties.issued) != null ? (_h = new Date(properties == null ? void 0 : properties.issued)) == null ? void 0 : _h.toISOString().replace(/[-:]/g, "").split(".")[0] : (/* @__PURE__ */ new Date()).toISOString().replace(/[-:]/g, "").split(".")[0];
    const sender = (_i = properties == null ? void 0 : properties.sender_icao) != null ? _i : `XXXX`;
    const header = `ZCZC-${parent}-${alertType}-${ugc}-${status}-${issued}-${sender}-`;
    return header;
  }
  /**
   * @function eventHandler
   * @description
   *     Routes a validated stanza object to the appropriate alert handler
   *     based on its type flags: API, CAP, pVTEC (Primary VTEC), UGC, or plain text.
   *
   * @static
   * @param {types.StanzaCompiled} validated
   * @returns {void}
   */
  static eventHandler(metadata) {
    const settings2 = settings;
    const preferences = settings2.noaa_weather_wire_service_settings.preferences;
    if (metadata.isApi) return api_default.event(metadata);
    if (metadata.isCap) return cap_default.event(metadata);
    if (!preferences.disable_vtec && !metadata.isCap && metadata.isPVtec && metadata.isUGC) return vtec_default.event(metadata);
    if (!preferences.disable_ugc && !metadata.isCap && !metadata.isPVtec && metadata.isUGC) return ugc_default2.event(metadata);
    if (!preferences.disable_text && !metadata.isCap && !metadata.isPVtec && !metadata.isUGC) return text_default2.event(metadata);
    return;
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
   * @param {types.PVtecEntry | null} pVtec
   * @param {Record<string, string>} attributes
   * @param {RegExpMatchArray | string | null} WMO
   * @returns {{ icao: string; name: string }}
   */
  static getICAO(pVtec, metadata, WMO) {
    var _a, _b, _c;
    const icao = pVtec != null ? pVtec == null ? void 0 : pVtec.tracking.split(`-`)[0] : ((_a = metadata.attributes) == null ? void 0 : _a.cccc) || (WMO != null ? Array.isArray(WMO) ? WMO[0] : WMO : `N/A`);
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
   * @returns {string}
   */
  static getCorrectIssuedDate(metadata) {
    var _a;
    const time = metadata.attributes.issue != null ? new Date(metadata.attributes.issue).toLocaleString() : ((_a = metadata.attributes) == null ? void 0 : _a.issue) != null ? new Date(metadata.attributes.issue).toLocaleString() : (/* @__PURE__ */ new Date()).toLocaleString();
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
   * @param {types.PVtecEntry} pVtec
   * @param {types.UGCEntry} ugc
   * @returns {string}
   */
  static getCorrectExpiryDate(pVtec, ugc) {
    const time = (pVtec == null ? void 0 : pVtec.expires) && !isNaN(new Date(pVtec.expires).getTime()) ? new Date(pVtec.expires).toLocaleString() : (ugc == null ? void 0 : ugc.expiry) != null ? new Date(ugc.expiry).toLocaleString() : new Date((/* @__PURE__ */ new Date()).getTime() + 1 * 60 * 60 * 1e3).toLocaleString();
    if (time == `Invalid Date`) return `Until Further Notice`;
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
   * @param {boolean} [isFiltered=false]
   * @param {number} [maxDistance]
   * @param {string} [unit='miles']
   * @returns {{ range?: Record<string, {unit: string, distance: number}>, in_range: boolean }}
   */
  static getLocationDistances(properties, unit) {
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
      return properties.distance;
    }
    return {};
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
   * @returns {any}
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
    if (event.pvtec) {
      const getType = event.pvtec.split(`.`)[0];
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
   * @returns {Promise<void>}
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
            yield events_default.eventHandler(validate);
            yield database_default.stanzaCacheImport(JSON.stringify(validate));
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
   * @returns {Promise<void>}
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
   * @param {boolean} [force=false]
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
            const validate = stanza_default.validate(readFile, { isCap, raw: true });
            yield events_default.eventHandler(validate);
          }
          this.warn(definitions.messages.dump_cache_complete, true);
        }
      } catch (error) {
        _Utils.warn(`Failed to load cache: ${error.stack}`);
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
          isPVtec: false,
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
   * @param {types.HTTPSettings} [options]
   * @returns {Promise<{ error: boolean; message: T | string }>}
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
   * @param {types.ClientSettingsTypes} settings
   * @returns {Record<string, unknown>}
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
   * @param {types.Coordinates} coord2
   * @param {'miles' | 'kilometers'} [unit='miles']
   * @returns {number}
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
   * @returns {boolean}
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
   * @param {string} header
   * @returns {Promise<string | null>}
   */
  static generateEASAudio(message, header) {
    return new Promise((resolve) => __async(this, null, function* () {
      const settings2 = settings;
      const assetsDir = settings2.global_settings.eas_settings.directory;
      const rngFile = `${header.replace(/[^a-zA-Z0-9]/g, `_`)}`.substring(0, 32).replace(/^_+|_+$/g, "");
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
      if (os2 == "win32") {
        packages.say.export(message, voice, 1, tmpTTS);
      }
      if (os2 == "linux") {
        message = message.replace(/[\r\n]+/g, " ");
        const festivalCommand = `echo "${message.replace(/"/g, '\\"')}" | text2wave -o "${tmpTTS}"`;
        packages.child.execSync(festivalCommand);
      }
      yield utils_default.sleep(3500);
      let ttsBuffer = null;
      while (!packages.fs.existsSync(tmpTTS) || (ttsBuffer = packages.fs.readFileSync(tmpTTS)).length === 0) {
        yield utils_default.sleep(25);
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
      build.push(this.generateSAMEHeader(header, 3, 8e3, { preMarkSec: 1.1, gapSec: 0.5 }), this.generateSilence(0.5, 8e3), this.generateAttentionTone(8, 8e3), this.generateSilence(0.5, 8e3), ttsRadio);
      for (let i = 0; i < 3; i++) {
        build.push(this.generateSAMEHeader(header, 1, 8e3, { preMarkSec: 0.5, gapSec: 0.1 }));
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
   * @returns { { samples: Int16Array; sampleRate: number; channels: number; bitsPerSample: number } | null }
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
   * @returns {Int16Array}
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
   * @returns {Float32Array}
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
   * @returns {Int16Array}
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
   * @param {number} originalRate
   * @param {number} targetRate
   * @returns {Int16Array}
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
   * @param {number} [sampleRate=8000]
   * @returns {Int16Array}
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
   * @param {number} [sampleRate=8000]
   * @returns {Int16Array}
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
   * @param {number} [sampleRate=8000]
   * @returns {Int16Array}
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
   * @param {number} [noiseLevel=0.02]
   * @returns {Int16Array}
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
   * @returns {number[]}
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
   * @param {number} [sampleRate=8000]
   * @returns {Int16Array}
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
   * @param {number} repeats
   * @param {number} [sampleRate=8000]
   * @param {{preMarkSec?: number, gapSec?: number}} [options={}]
   * @returns {Int16Array}
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
   * @param {types.Coordinates} [coordinates]
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
   * @param {string} header
   * @returns {Promise<Buffer>}
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
   * @param {number} [limit=250]
   * @returns {Promise<any[]>}
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
   * @returns {Promise<void>}
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
   * @param {(...args: any[]) => void} callback
   * @returns {() => void}
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
   * @returns {Promise<void>}
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
        (() => __async(this, null, function* () {
          try {
            yield database_default.loadDatabase();
            yield xmpp_default.deploySession();
            yield utils_default.loadCollectionCache();
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            utils_default.warn(`Failed to initialize NWWS services: ${msg}`);
          }
        }))();
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
  hvtec_default as HVtecParser,
  pvtec_default as PVtecParser,
  stanza_default as StanzaParser,
  text_default as TextParser,
  ugc_default as UGCParser,
  utils_default as Utils,
  index_default as default
};
