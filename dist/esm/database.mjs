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
import * as cron from "node-cron";
import sqlite3 from "better-sqlite3";
import axios from "axios";
import crypto from "crypto";
import os from "os";
import say from "say";

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
  { type: "Update", forward: "Updated", cancel: false },
  { type: "Cancel", forward: "Cancelled", cancel: true },
  { type: "Alert", forward: "Issued", cancel: false },
  { type: "Updated", forward: "Updated", cancel: false },
  { type: "Expired", forward: "Expired", cancel: true },
  { type: "Issued", forward: "Issued", cancel: false },
  { type: "Extended", forward: "Updated", cancel: false },
  { type: "Correction", forward: "Updated", cancel: false },
  { type: "Upgraded", forward: "Upgraded", cancel: false },
  { type: "Cancelled", forward: "Cancelled", cancel: true },
  { type: "Routine", forward: "Routine", cancel: false }
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
  ABV: `abv`,
  ADA: `administrative-message`,
  ADM: `administrative-message`,
  ADR: `administrative-message`,
  AHD: `area-hydrological-discussion`,
  AHONT1: `high-density-observations-usaf-noaa`,
  AHOPA1: `high-density-observations-usaf-noaa-west-pac`,
  AHOPN1: `high-density-observations-usaf-noaa`,
  AFD: `area-forecast-discussion`,
  AQA: `air-quality-alert`,
  AQI: `ground-level-ozone-forecast`,
  AVA: `avalanche-watch`,
  AVW: `avalanche-warning`,
  AWU: `area-weather-update`,
  AVG: `avalanche-weather-guidance`,
  AWW: `airport-weather-warning`,
  BLU: `blue-alert`,
  CAE: `child-abduction-emergency`,
  CDW: `civil-danger-warning`,
  CEM: `civil-emergency-message`,
  CFW: `coastal-hazard-message`,
  CGR: `coastal-weather-observations`,
  CLI: `daily-climate-report`,
  CLM: `monthly-climate-report`,
  CRF: `contingency-river-forecast`,
  CWA: `center-weather-advisory`,
  CWF: `coastal-waters-forecast`,
  DGT: `drought-information`,
  DSA: `tropical-disturbance-statement`,
  DSW: `dust-storm-warning`,
  EQI: `earthquake-information`,
  EQR: `earthquake-report`,
  EQW: `earthquake-warning`,
  ESF: `hydrologic-outlook`,
  EVI: `evacuation-immediate`,
  EWW: `extreme-wind-warning`,
  FFA: `flood-watch`,
  FFG: `flash-flood-guidance`,
  FFGMPD: `mesoscale-precipitation-discussion`,
  FLS: `flood-advisory`,
  FLW: `flood-warning`,
  FFS: `flash-flood-statement`,
  FFW: `flash-flood-warning`,
  MWS: `marine-weather-statement`,
  MWW: `marine-weather-warning`,
  NMN: `network-message-notification`,
  NOW: `short-term-forecast`,
  NPW: `non-convective-advisory`,
  NSH: `nearshore-marine-forecast`,
  NUW: `nuclear-power-plant-warning`,
  PMDAK: `alaska-discussion`,
  PMDCA: `tropical-discussion`,
  PMDEPD: `extended-forecast-discussion`,
  PMDHI: `hawaii-discussion`,
  PMDHMD: `model-diagnostic-discussion`,
  PMDSA: `south-america-forecast-discussion`,
  PMDSPD: `short-range-forecast-discussion`,
  PNS: `public-information-statement`,
  FRW: `fire-warning`,
  FTM: `free-text-message`,
  FWF: `fire-weather-planning-forecast`,
  FWA: `fire-weather-administrative-message`,
  FWS: `fire-weather-spot-forecast`,
  GLF: `open-lake-forecast`,
  HCM: `hydromet-coordination-message`,
  HMT: `hmt`,
  HMW: `hazardous-materials-warning`,
  HPA: `high-pollution-advisory`,
  HLS: `hurricane-local-statement`,
  HMD: `rainfall-and-flood-outlook-product`,
  HSF: `high-seas-forecast`,
  HWO: `hazardous-weather-outlook`,
  HYD: `supplementary-temp-and-precip`,
  LAE: `local-area-emergency`,
  LCO: `local-cooperative-observation`,
  LEW: `law-enforcement-warning`,
  LSR: `local-storm-report`,
  ICE: `ice-outlook`,
  MIS: `meteorological-impact-statement`,
  OAV: `other-aviation-report`,
  OEP: `taf-collaboration-product`,
  OFF: `offshore-waters-forecast`,
  OMR: `other-marine-reports`,
  OSO: `weather-roundup`,
  PFM: `point-forecast-matrices`,
  PSH: `post-tropical-event-report`,
  PWO: `public-severe-weather-outlook`,
  QPFERD: `excessive-rainfall-discussion`,
  QPFHSD: `heavy-snow-discussion`,
  QPS: `quantitative-precipitation-forecast`,
  REC: `recreational-forecast`,
  REPNT0: `recco-observations-non-tropical-cyclone`,
  REPNT1: `recco-observations-tropical-cyclone`,
  REPNT2: `vortex-data-message`,
  REPNTS: `supplementary-vortex-data-message`,
  REPNT3: `dropsonde-observations`,
  REPPN0: `recco-observations-non-tropical-cyclone`,
  REPPN1: `recco-observations-tropical-cyclone`,
  REPPN2: `vortex-data-message`,
  REPPNS: `supplementary-vortex-data-message`,
  REPPN3: `dropsonde-observations`,
  REPPA0: `recco-observations-west-pac-non-tropical-cyclone`,
  REPPA1: `recco-observations-west-pac-tropical-cyclone`,
  REPPA2: `vortex-data-message-west-pac`,
  REPPAS: `supplementary-vortex-data-message-west-pac`,
  REPPA3: `dropsonde-observations-west-pac`,
  REPRPD: `weather-reconnaissance-flights`,
  RER: `record-event-report`,
  RFD: `grassland-fire-danger`,
  RFW: `red-flag-warning`,
  RHW: `radiological-hazard-warning`,
  RRM: `rainfall-storm-total`,
  RTP: `regional-temperature-and-precipitation`,
  RVA: `hydrologic-summary`,
  RVD: `river-and-lake-summary`,
  RVF: `river-forecast`,
  RVS: `hydrologic-statement`,
  RWR: `weather-roundup`,
  RWS: `regional-weather-summary`,
  SAB: `special-avalanche-bulletin`,
  SCC: `storm-summary`,
  SFT: `state-forecast-tabular-product`,
  SIG: `convective-sigment`,
  SMF: `smoke-management-weather-forecast`,
  SMW: `special-marine-warning`,
  SPS: `special-weather-statement`,
  SPW: `shelter-in-place-warning`,
  SQW: `snow-squall-warning`,
  SRF: `surf-zone-forecast`,
  STF: `tabular-state-forecast`,
  STQ: `spot-forecast-request`,
  SVR: `severe-thunderstorm-warning`,
  SVS: `severe-weather-statement`,
  SWOMCD: `mesoscale-convective-discussion`,
  TAF: `terminal-aerodrome-forecast`,
  TCD: `tropical-cyclone-discussion`,
  TCE: `tropical-cyclone-position-estimate`,
  TCM: `tropical-storm-forecast`,
  TCU: `tropical-cyclone-update`,
  TCV: `tropical-watch-warning-local-statement`,
  TIB: `tsunami-information-statement`,
  TID: `tide-data`,
  TMA: `tsunami-message-acknowledgement`,
  TOE: `telephone-outage-emergency`,
  TOR: `tornado-warning`,
  TWD: `tropical-weather-discussion`,
  TWO: `tropical-weather-outlook`,
  VAA: `volcanic-ash-advisory`,
  VOW: `volcano-warning`,
  WCN: `watch-county-notification`,
  WRK: `work-product`,
  WSV: `volcanic-ash-sigmet`,
  WSW: `winter-weather-message`,
  XTEUS: `wpc-contiguous-us-daily-max-min-temps`,
  ZFP: `zone-forecast-package`,
  RR1: `hydro-meteorological-data-report-pt1`,
  RR2: `hydro-meteorological-data-report-pt2`,
  RR3: `hydro-meteorological-data-report-pt3`,
  RR4: `hydro-meteorological-data-report-pt4`,
  RR5: `hydro-meteorological-data-report-pt5`,
  RR6: `hydro-meteorological-data-report-pt6`,
  RR7: `hydro-meteorological-data-report-pt7`,
  RR8: `hydro-meteorological-data-report-pt8`,
  RR9: `hydro-meteorological-data-report-pt9`,
  SFP: `state-forecast-product`,
  AFM: `area-forecast-matrices`,
  AAG: `aag`,
  ADV: `adv`,
  AFP: `afp`,
  AFW: `afw`,
  AGO: `ago`,
  AIR: `air`,
  ALG: `alg`,
  ALT: `alt`,
  AVD: `avd`,
  AWO: `awo`,
  BOY: `boy`,
  BRT: `brt`,
  CF6: `cf6`,
  CFP: `cfp`,
  CLS: `cls`,
  CMM: `cmm`,
  COD: `cod`,
  CRN: `crn`,
  CUR: `cur`,
  CWD: `cwd`,
  CWS: `cws`,
  DAY: `day`,
  DDO: `ddo`,
  DMO: `dmo`,
  DSM: `dsm`,
  ECD: `ecd`,
  EFP: `efp`,
  EOL: `eol`,
  EOM: `eom`,
  ESG: `esg`,
  ESP: `esp`,
  ESS: `ess`,
  ETT: `ett`,
  FA0: `fa0`,
  FA7: `fa7`,
  FA8: `fa8`,
  FA9: `fa9`,
  FD0: `fd0`,
  FD1: `fd1`,
  FD3: `fd3`,
  FD5: `fd5`,
  FD8: `fd8`,
  FD9: `fd9`,
  FDI: `fdi`,
  FFH: `ffh`,
  FFP: `ffp`,
  FLR: `flr`,
  FOP: `fop`,
  FRH: `frh`,
  FSH: `fsh`,
  FTP: `ftp`,
  FWD: `fwd`,
  FWL: `fwl`,
  FWM: `fwm`,
  FWN: `fwn`,
  FWO: `fwo`,
  FZL: `fzl`,
  GEN: `gen`,
  GMT: `gmt`,
  HD0: `hd0`,
  HD2: `hd2`,
  HD3: `hd3`,
  HD4: `hd4`,
  HD6: `hd6`,
  HD8: `hd8`,
  HML: `hml`,
  HWR: `hwr`,
  LAK: `lak`,
  LEV: `lev`,
  LLL: `lll`,
  HP2: `hp2`,
  HRR: `hrr`,
  HYM: `hym`,
  ICO: `ico`,
  IDM: `idm`,
  MAN: `man`,
  MAP: `map`,
  MAR: `mar`,
  MAV: `mav`,
  MCG: `mcg`,
  MCX: `mcx`,
  MET: `met`,
  MEX: `mex`,
  MFM: `mfm`,
  MFP: `mfp`,
  MHF: `mhf`,
  MME: `mme`,
  MMG: `mmg`,
  MRP: `mrp`,
  MSM: `msm`,
  MTR: `mtr`,
  MTT: `mtt`,
  MVF: `mvf`,
  NWR: `nwr`,
  OFA: `ofa`,
  OPU: `opu`,
  OPW: `opw`,
  OSB: `osb`,
  PFW: `pfw`,
  PLS: `pls`,
  PMD: `pmd`,
  POE: `poe`,
  PRB: `prb`,
  PTS: `pts`,
  PWS: `pws`,
  QPF: `qpf`,
  QPG: `qpg`,
  RBG: `rbg`,
  REP: `rep`,
  RFM: `rfm`,
  RFR: `rfr`,
  RRA: `rra`,
  RRS: `rrs`,
  RRY: `rry`,
  RRZ: `rrz`,
  RVC: `rvc`,
  RVG: `rvg`,
  RVK: `rvk`,
  RVM: `rvm`,
  RVO: `rvo`,
  RVR: `rvr`,
  RVU: `rvu`,
  SAF: `saf`,
  SAG: `sag`,
  SAT: `sat`,
  SAW: `saw`,
  SCN: `scn`,
  SCP: `scp`,
  SCS: `scs`,
  SCV: `scv`,
  SEL: `sel`,
  SGL: `sgl`,
  SPE: `spe`,
  SPN: `spn`,
  SRG: `srg`,
  SSM: `ssm`,
  STA: `sta`,
  SUM: `sum`,
  SWE: `swe`,
  SYN: `syn`,
  TAP: `tap`,
  TCA: `tca`,
  TCP: `tcp`,
  TCS: `tcs`,
  TPT: `tpt`,
  TST: `tst`,
  TSU: `tsu`,
  TUV: `tuv`,
  TVL: `tvl`,
  TWS: `tws`,
  TXT: `txt`,
  UVI: `uvi`,
  VFT: `vft`,
  WA0: `wa0`,
  WA1: `wa1`,
  WA2: `wa2`,
  WA3: `wa3`,
  WA4: `wa4`,
  WA5: `wa5`,
  WA6: `wa6`,
  WA7: `wa7`,
  WA8: `wa8`,
  WA9: `wa9`,
  WAR: `war`,
  WAT: `wat`,
  WCL: `wcl`,
  WEE: `wee`,
  WEK: `wek`,
  WOU: `wou`,
  WRM: `wrm`,
  WS1: `ws1`,
  WS2: `ws2`,
  WS3: `ws3`,
  WS4: `ws4`,
  WS5: `ws5`,
  WS6: `ws6`,
  WSC: `wsc`,
  WST: `wst`,
  WTA: `wta`,
  WWA: `wwa`,
  WWP: `wwp`,
  XF0: `xf0`,
  XOB: `xob`
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
  sqlite3,
  cron,
  axios,
  crypto,
  os,
  say
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
      ignoredEvents: [`Unknown`, `Test Message`],
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
export {
  Database,
  database_default as default
};
