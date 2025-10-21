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


import * as fs from 'fs';
import * as path from 'path';
import * as events from 'events';
import * as xmpp from '@xmpp/client';
import * as shapefile from 'shapefile';
import * as xml2js from 'xml2js';
import * as jobs from 'croner';
import sqlite3 from 'better-sqlite3';
import axios from 'axios';
import crypto from 'crypto';
import os from 'os';
import say from 'say';
import child from 'child_process';


import * as dictEvents from './dictionaries/events';
import * as dictOffshore from './dictionaries/offshore';
import * as dictAwips from './dictionaries/awips';
import * as dictSignatures from './dictionaries/signatures';
import * as dictICAOs from './dictionaries/icao';


export const packages = {
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
    child,
};

export const cache = {
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
    currentLocations: {},
};

export const settings = { 
    database: path.join(process.cwd(), 'shapefiles.db'),
    is_wire: true,
    journal: true,
    noaa_weather_wire_service_settings: {
        reconnection_settings: {
            enabled: true,
            interval: 60,
        },
        credentials: {
            username: null,
            password: null,
            nickname: "AtmosphericX Standalone Parser",
        },   
        cache: {
            enabled: false,
            max_file_size: 5,
            max_db_history: 5000,
            directory: null,
        },
        preferences: {
            cap_only: false,
            shapefile_coordinates: false,
        }
    },
    national_weather_service_settings: {
        interval: 15,
        endpoint: `https://api.weather.gov/alerts/active`,
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
            },
        },
        eas_settings: {
            directory: null,
            intro_wav: null,
            festival_tts_voice: `kal_diphone`,
        }
    }
};


export const definitions = {
    events: dictEvents.EVENTS,
    actions: dictEvents.ACTIONS,
    status: dictEvents.STATUS,
    productTypes: dictEvents.TYPES,
    correlations: dictEvents.STATUS_CORRELATIONS,
    offshore: dictOffshore.OFFSHORE,
    awips: dictAwips.AWIPS,
    cancelSignatures: dictSignatures.CANCEL_SIGNATURES,
    messageSignatures: dictSignatures.MESSAGE_SIGNATURES,
    tags: dictSignatures.TAGS,
    ICAO: dictICAOs.ICAOs,
    enhancedEvents: [
        {"Tornado Warning": {
            "Tornado Emergency": { description: "tornado emergency", condition: (tornadoThreatTag: string) => tornadoThreatTag === 'OBSERVED'},
            "PDS Tornado Warning": { description: "particularly dangerous situation", condition: (damageThreatTag: string) => damageThreatTag === 'CONSIDERABLE'},
            "Confirmed Tornado Warning": { condition: (tornadoThreatTag: string) => tornadoThreatTag === 'OBSERVED'},
            "Radar Indicated Tornado Warning": {condition: (tornadoThreatTag: string) => tornadoThreatTag !== 'OBSERVED'},
        }},
        {"Tornado Watch": {
            "PDS Tornado Watch": { description: "particularly dangerous situation"}
        }},
        {"Flash Flood Warning": {
            "Flash Flood Emergency": { description: "flash flood emergency", },
            "Considerable Flash Flood Warning": { condition: (damageThreatTag: string) => damageThreatTag === 'CONSIDERABLE' },
        }},
        {"Severe Thunderstorm Warning": {
            "EDS Severe Thunderstorm Warning": {description: "extremely dangerous situation"},
            "Destructive Severe Thunderstorm Warning": {condition: (damageThreatTag: string) => damageThreatTag === 'DESTRUCTIVE'},
            "Considerable Severe Thunderstorm Warning": {condition: (damageThreatTag: string) => damageThreatTag === 'CONSIDERABLE'},
        }},
    ],
    expressions: {
        vtec: `[OTEX].(NEW|CON|EXT|EXA|EXB|UPG|CAN|EXP|COR|ROU).[A-Z]{4}.[A-Z]{2}.[WAYSFON].[0-9]{4}.[0-9]{6}T[0-9]{4}Z-[0-9]{6}T[0-9]{4}Z`,
        wmo: `[A-Z0-9]{6}\\s[A-Z]{4}\\s\\d{6}`,
        ugc1: `(\\w{2}[CZ](\\d{3}((-|>)\\s?(\n\n)?))+)`,
        ugc2: `(\\d{6}(-|>)\\s?(\n\n)?)`,
        ugc3: `(\\d{6})(?=-|$)`,
        dateline: `/\d{3,4}\s*(AM|PM)?\s*[A-Z]{2,4}\s+[A-Z]{3,}\s+[A-Z]{3,}\s+\d{1,2}\s+\d{4}`,
        wmoID: `[A-Z0-9]{2}([A-Z]{3})`,
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
        shapefile_creation: `DO NOT CLOSE THIS PROJECT UNTIL THE SHAPEFILES ARE DONE COMPLETING!\n\t THIS COULD TAKE A WHILE DEPENDING ON THE SPEED OF YOUR STORAGE!!\n\t IF YOU CLOSE YOUR PROJECT, THE SHAPEFILES WILL NOT BE CREATED AND YOU WILL NEED TO DELETE ${settings.database} AND RESTART TO CREATE THEM AGAIN!`,
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
        eas_missing_festival: `Festival TTS engine is not installed or not found in PATH. Please install Festival to enable EAS audio generation on Linux and macOS systems.`,
    }
};