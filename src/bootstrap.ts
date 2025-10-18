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
    say
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
    events: new events.EventEmitter(),
    isProcessingAudioQueue: false,
    audioQueue: [],
    currentLocations: {},
};

export const settings = { 
    database: path.join(process.cwd(), 'shapefiles.db'),
    isNWWS: true,
    catchUnhandledExceptions: false,
    NoaaWeatherWireService: {
        clientReconnections: {
            canReconnect: true,
            currentInterval: 60,
        },
        clientCredentials: {
            username: null,
            password: null,
            nickname: "AtmosphericX Standalone Parser",
        },   
        cache: {
            read: false,
            maxSizeMB: 5,
            maxHistory: 5000,
            directory: null,
        },
        alertPreferences: {
            isCapOnly: false,
            isShapefileUGC: false,
        }
    },
    NationalWeatherService: {
        checkInterval: 15,
        endpoint: "https://api.weather.gov/alerts/active",
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
            checkExpired: true,
            locationFiltering: {
                maxDistance: 100,
                unit: `miles`,
                filterByCurrentLocation: true
            },
        },
        easSettings: {
            easAlerts: [],
            easDirectory: null,
            easIntroWav: null,
        }
    }
}


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
        shapefile_creation: `[NOTICE] DO NOT CLOSE THIS PROJECT UNTIL THE SHAPEFILES ARE DONE COMPLETING!\n\t THIS COULD TAKE A WHILE DEPENDING ON THE SPEED OF YOUR STORAGE!!\n\t IF YOU CLOSE YOUR PROJECT, THE SHAPEFILES WILL NOT BE CREATED AND YOU WILL NEED TO DELETE ${settings.database} AND RESTART TO CREATE THEM AGAIN!`,
        shapefile_creation_finished: `[NOTICE] SHAPEFILES HAVE BEEN SUCCESSFULLY CREATED AND THE DATABASE IS READY FOR USE!`,
        not_ready: "[ERROR] You can NOT create another instance without shutting down the current one first, please make sure to call the stop() method first!",
        invalid_nickname: "[WARNING] The nickname you provided is invalid, please provide a valid nickname to continue.",
        eas_no_directory: "[WARNING] You have not set a directory for EAS audio files to be saved to, please set the 'easDirectory' setting in the global settings to enable EAS audio generation.",
        invalid_coordinates: "[WARNING] The coordinates you provided are invalid, please provide valid latitude and longitude values.",
    }
};