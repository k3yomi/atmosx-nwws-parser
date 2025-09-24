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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtmosXWireParser = void 0;
var loader = __importStar(require("../bootstrap"));
var stanza_1 = __importDefault(require("./stanza"));
var AtmosXWireParser = /** @class */ (function () {
    function AtmosXWireParser(metadata) {
        var _this = this;
        /**
          * @function initalizeDatabase
          * @description Initalizes the database and creates the shapefiles table if it does not exist.
          * Also imports shapefiles into the database if the table is created.
          *
          * @param {string} database - The path to the database file.
          */
        this.initalizeDatabase = function (database) { return __awaiter(_this, void 0, void 0, function () {
            var _a, fs, sqlite3, path, shapefile, db, parseShapefiles, isExisting;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this.packages, fs = _a.fs, sqlite3 = _a.sqlite3, path = _a.path, shapefile = _a.shapefile;
                        if (!fs.existsSync(database)) { // If the database file DOES NOT exist, create it with empty content
                            fs.writeFileSync(database, '', 'utf8');
                        }
                        db = new sqlite3(database);
                        loader.statics.db = db;
                        parseShapefiles = function () { return __awaiter(_this, void 0, void 0, function () {
                            var shapefiles, _i, shapefiles_1, shape, id, file, filepath, features, _a, features_1, feature, properties, geometry, equals, location_1, importStatement;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        shapefiles = [{ id: "C", file: "USCounties" }, { id: "Z", file: "ForecastZones" }, { id: "Z", file: "FireZones" }, { id: "Z", file: "OffShoreZones" }, { id: "Z", file: "FireCounties" }, { id: "Z", file: "Marine" }];
                                        _i = 0, shapefiles_1 = shapefiles;
                                        _b.label = 1;
                                    case 1:
                                        if (!(_i < shapefiles_1.length)) return [3 /*break*/, 8];
                                        shape = shapefiles_1[_i];
                                        id = shape.id, file = shape.file;
                                        filepath = path.join(__dirname, "../../shapefiles", file);
                                        return [4 /*yield*/, shapefile.read(filepath, filepath)];
                                    case 2:
                                        features = (_b.sent()).features;
                                        console.log("Importing ".concat(features.length, " features from ").concat(file, "..."));
                                        _a = 0, features_1 = features;
                                        _b.label = 3;
                                    case 3:
                                        if (!(_a < features_1.length)) return [3 /*break*/, 6];
                                        feature = features_1[_a];
                                        properties = feature.properties, geometry = feature.geometry;
                                        equals = void 0, location_1 = void 0;
                                        if (properties.FIPS) {
                                            equals = "".concat(properties.STATE).concat(id).concat(properties.FIPS.substring(2));
                                            location_1 = "".concat(properties.COUNTYNAME, ", ").concat(properties.STATE);
                                        }
                                        else if (properties.FULLSTAID) {
                                            equals = "".concat(properties.ST).concat(id).concat(properties.WFO);
                                            location_1 = "".concat(properties.CITY, ", ").concat(properties.STATE);
                                        }
                                        else if (properties.STATE) {
                                            equals = "".concat(properties.STATE).concat(id).concat(properties.ZONE);
                                            location_1 = "".concat(properties.NAME, ", ").concat(properties.STATE);
                                        }
                                        else {
                                            equals = properties.ID;
                                            location_1 = properties.NAME;
                                        }
                                        importStatement = "INSERT OR REPLACE INTO shapefiles (id, location, geometry) VALUES (?, ?, ?)";
                                        return [4 /*yield*/, db.prepare(importStatement).run(equals, location_1, JSON.stringify(geometry))];
                                    case 4:
                                        _b.sent();
                                        _b.label = 5;
                                    case 5:
                                        _a++;
                                        return [3 /*break*/, 3];
                                    case 6:
                                        console.log("Finished importing ".concat(file, "."));
                                        _b.label = 7;
                                    case 7:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 8: return [2 /*return*/];
                                }
                            });
                        }); };
                        isExisting = function () { return __awaiter(_this, void 0, void 0, function () {
                            var checkStatement;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        checkStatement = "SELECT name FROM sqlite_master WHERE type='table' AND name='shapefiles'";
                                        if (!!db.prepare(checkStatement).get()) return [3 /*break*/, 2];
                                        db.prepare("CREATE TABLE shapefiles (id TEXT PRIMARY KEY, location TEXT, geometry TEXT)").run();
                                        console.log(loader.definitions.messages.shapefile_creation);
                                        return [4 /*yield*/, parseShapefiles()];
                                    case 1:
                                        _a.sent();
                                        console.log(loader.definitions.messages.shapefile_creation_finished);
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); };
                        return [4 /*yield*/, isExisting()];
                    case 1:
                        _b.sent();
                        this.initalizeSession(this.metadata);
                        return [2 /*return*/];
                }
            });
        }); };
        /**
          * @function initalizeClient
          * @description Initalizes the XMPP client and sets up event listeners.
          *
          * @param {object} metadata - The metadata object containing authentication information.
          */
        this.initalizeClient = function (metadata) {
            if (loader.settings.database == null) {
                throw new Error("error-database-not-configured");
            }
            loader.statics.session = loader.packages.xmpp.client({
                service: "xmpp://nwws-oi.weather.gov",
                domain: "nwws-oi.weather.gov",
                username: metadata.authentication.username || null,
                password: metadata.authentication.password || null,
            });
        };
        /**
          * @function initalizeSession
          * @description Initalizes the XMPP session and sets up event listeners for connection, disconnection, errors, and incoming stanzas.
          *
          * @param {object} metadata - The metadata object containing authentication information.
          *
          * @emits onConnection - Emitted when the client successfully connects to the XMPP server.
          * @emits onStanza - Emitted when a valid stanza is received from the XMPP server.
          * @emits onError - Emitted when an error occurs.
          * @emits onReconnect - Emitted when the client attempts to reconnect to the XMPP server.
          * @throws Will throw an error if the database is not configured, if the client is reconnecting too fast, or if the connection to the XMPP server is lost.
          */
        this.initalizeSession = function (metadata) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.metadata.authentication.display == undefined)
                            this.metadata.authentication.display = this.metadata.authentication.username || "No Username Provided";
                        this.initalizeClient(this.metadata);
                        loader.statics.session.on("online", function (address) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            return __generator(this, function (_a) {
                                if (loader.cache.lastConnect && (new Date().getTime() - loader.cache.lastConnect) < 10 * 1000) {
                                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, loader.statics.session.stop().catch(function () { })];
                                                case 1:
                                                    _a.sent();
                                                    return [4 /*yield*/, loader.statics.session.start().catch(function () { })];
                                                case 2:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    }); }, 2 * 1000);
                                    loader.cache.sigHault = true;
                                    throw new Error("error-reconnecting-too-fast"); // Patch v1.0.14 - Prevents reconnecting too fast
                                }
                                loader.statics.session.send(loader.packages.xmpp.xml('presence', { to: "nwws@conference.nwws-oi.weather.gov/".concat(this.metadata.authentication.display), xmlns: 'http://jabber.org/protocol/muc' }));
                                loader.statics.session.send(loader.packages.xmpp.xml('presence', { to: "nwws@conference.nwws-oi.weather.gov", type: 'available' }));
                                loader.statics.events.emit("onConnection", this.metadata.authentication.display);
                                loader.cache.lastConnect = new Date().getTime();
                                loader.cache.sigHault = false;
                                loader.cache.isConnected = true;
                                if (loader.cache.attemptingReconnect) {
                                    setTimeout(function () { loader.cache.attemptingReconnect = false; }, 15 * 1000);
                                }
                                return [2 /*return*/];
                            });
                        }); });
                        loader.statics.session.on("offline", function () {
                            loader.cache.isConnected = false;
                            loader.cache.sigHault = true;
                            loader.cache.attemptingReconnect = false;
                            throw new Error("error-connection-lost");
                        });
                        loader.statics.session.on("error", function (err) {
                            loader.cache.isConnected = false;
                            loader.cache.sigHault = true;
                            loader.cache.attemptingReconnect = false;
                            throw new Error(err.message || "error-connection-lost");
                        });
                        loader.statics.session.on("stanza", function (stanza) {
                            loader.cache.lastStanza = new Date().getTime();
                            try {
                                if (stanza.is("message")) {
                                    var sValid = stanza_1.default.validate(stanza);
                                    if (sValid.ignore || (sValid.isCap && !loader.settings.alertSettings.onlyCap) || (!sValid.isCap && loader.settings.alertSettings.onlyCap) || (sValid.isCap && !sValid.hasCapDescription))
                                        return;
                                    loader.statics.events.emit("onMessage", sValid);
                                    stanza_1.default.create(sValid);
                                }
                                if (stanza.is('presence') && stanza.attrs.from && stanza.attrs.from.startsWith('nwws@conference.nwws-oi.weather.gov/')) {
                                    var occupant = stanza.attrs.from.split('/').slice(1).join('/');
                                    loader.statics.events.emit('onOccupant', { occupant: occupant, type: stanza.attrs.type === 'unavailable' ? 'unavailable' : 'available' });
                                }
                            }
                            catch (error) {
                                loader.statics.events.emit("onError", { error: error.message || "An unknown error occurred", code: "stanza-parse-error" });
                                return;
                            }
                        });
                        return [4 /*yield*/, loader.statics.session.start()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        /**
          * @function initalizeCache
          * @description Initalizes the cache by reading cached stanzas from files in the cache directory.
          * The function checks the alert settings to determine which files to read and processes each file by validating and creating stanzas.
          * If the cache directory is not set or reading from cache is disabled, the function returns without performing any actions.
          */
        this.initalizeCache = function () {
            if (loader.settings.cacheSettings.readCache && loader.settings.cacheSettings.cacheDir) {
                var dir = loader.settings.cacheSettings.cacheDir;
                var dict = [
                    { file: "".concat(dir, "/category-defaults-raw-vtec.bin"), attributes: { awipsid: 'alert', isCap: false, raw: true, issue: undefined } },
                    { file: "".concat(dir, "/category-defaults-cap-vtec.bin"), attributes: { awipsid: 'alert', isCap: true, raw: false, issue: undefined } },
                    { file: "".concat(dir, "/category-special-weather-statements-raw.bin"), attributes: { awipsid: 'SPS001', isCap: false, raw: true, issue: undefined } },
                    { file: "".concat(dir, "/category-mesoscale-discussions-raw.bin"), attributes: { awipsid: 'SWOMCD001', isCap: false, raw: true, issue: undefined } },
                    { file: "".concat(dir, "/category-local-storm-reports.bin"), attributes: { awipsid: 'LSR001', isCap: false, raw: true, issue: undefined } },
                ];
                for (var _i = 0, dict_1 = dict; _i < dict_1.length; _i++) {
                    var file = dict_1[_i];
                    if (file.attributes.isCap && !loader.settings.alertSettings.onlyCap)
                        continue;
                    if (!file.attributes.isCap && loader.settings.alertSettings.onlyCap)
                        continue;
                    if (!_this.packages.fs.existsSync(file.file))
                        continue;
                    var read = _this.packages.fs.readFileSync(file.file, 'utf8');
                    var sValid = stanza_1.default.validate(read, file.attributes);
                    stanza_1.default.create(sValid);
                }
            }
        };
        /**
          * @function errorHandler
          * @description Sets up a global error handler to catch uncaught exceptions and emit an 'onError' event with the error details.
          * The function checks if the error message matches any predefined halting conditions and includes the corresponding message and code in the emitted event.
          * This helps in logging and handling errors gracefully within the application.
          */
        this.errorHandler = function () {
            process.on('uncaughtException', function (error) {
                var hault = loader.definitions.haultingConditions.find(function (e) { return error.message.includes(e.error); });
                if (hault) {
                    loader.statics.events.emit("onError", { error: "".concat(hault ? hault.message : error.message), code: hault.code });
                }
                loader.statics.events.emit("onError", { error: error.stack || error.message || "An unknown error occurred", code: "uncaught-exception" });
            });
        };
        /**
          * @function garabeCollector
          * @description Cleans up cache files in the specified cache directory that exceed the maximum allowed size.
          * The function traverses the cache directory and its subdirectories, checking the size of each file.
          * If a file exceeds the specified maximum size in megabytes, it is deleted.
          *
          * @param {number} maxMegabytes - The maximum allowed size for cache files in megabytes.
          */
        this.garabeCollector = function (maxMegabytes) {
            if (!loader.settings.cacheSettings.cacheDir)
                return;
            var maxBytes = maxMegabytes * 1024 * 1024;
            var directory = loader.settings.cacheSettings.cacheDir;
            var stackFiles = [directory], files = [];
            var _loop_1 = function () {
                var currentDirectory = stackFiles.pop();
                if (!currentDirectory || typeof currentDirectory !== "string")
                    return "continue";
                loader.packages.fs.readdirSync(currentDirectory).forEach(function (file) {
                    var filePath = loader.packages.path.join(currentDirectory, file);
                    if (loader.packages.fs.statSync(filePath).isDirectory()) {
                        stackFiles.push(filePath);
                    }
                    else {
                        files.push({ file: filePath, size: loader.packages.fs.statSync(filePath).size });
                    }
                });
            };
            while (stackFiles.length) {
                _loop_1();
            }
            if (!files.length)
                return;
            files.forEach(function (_a) {
                var file = _a.file, size = _a.size;
                if (size > maxBytes) {
                    loader.packages.fs.unlinkSync(file);
                }
            });
            return;
        };
        /**
          * @function isReconnectEligible
          * @description Checks if the client is eligible to reconnect based on the specified interval.
          * If the client is not connected and the last stanza received was longer than the specified interval ago,
          * the function attempts to reconnect the client.
          *
          * @param {number} interval - The minimum interval in seconds between reconnection attempts.
          * @returns {object} An object containing the connection status and session information.
          */
        this.isReconnectEligible = function (interval) { return __awaiter(_this, void 0, void 0, function () {
            var minSeconds, lastStanza;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        minSeconds = interval;
                        if (!((loader.cache.isConnected || loader.cache.sigHault === true) && loader.statics.session)) return [3 /*break*/, 3];
                        lastStanza = new Date().getTime() - loader.cache.lastStanza;
                        if (!(lastStanza > minSeconds * 1000)) return [3 /*break*/, 3];
                        if (!!loader.cache.attemptingReconnect) return [3 /*break*/, 3];
                        loader.cache.attemptingReconnect = true;
                        loader.cache.isConnected = false;
                        loader.cache.totalReconnects += 1;
                        loader.statics.events.emit("onReconnect", { reconnects: loader.cache.totalReconnects, lastStanza: lastStanza / 1000, lastName: this.metadata.authentication.display });
                        return [4 /*yield*/, loader.statics.session.stop().catch(function () { })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, loader.statics.session.start().catch(function () { })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, {
                            message: "Session is not connected or session is not available",
                            isConnected: loader.cache.isConnected,
                            session: loader.statics.session
                        }];
                }
            });
        }); };
        /**
          * @function setDisplayName
          * @description Sets the display name for the XMPP session.
          *
          * @param {string} name - The display name to set for the session.
          */
        this.setDisplayName = function (name) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.metadata.authentication.display = name;
                return [2 /*return*/];
            });
        }); };
        /**
          * @function onEvent
          * @description Registers an event listener for the specified event and returns a function to remove the listener.
          *
          * @param {string} event - The name of the event to listen for.
          * @param {function} callback - The callback function to execute when the event is emitted.
          * @returns {function} A function that removes the event listener when called.
          */
        this.onEvent = function (event, callback) {
            loader.statics.events.on(event, callback);
            return function () { loader.statics.events.off(event, callback); };
        };
        this.packages = loader.packages;
        this.metadata = metadata;
        Object.assign(loader.settings, metadata);
        this.errorHandler();
        this.initalizeDatabase(this.metadata.database);
        this.initalizeCache();
        setInterval(function () {
            if (loader.settings.cacheSettings.cacheDir) {
                _this.garabeCollector(loader.settings.cacheSettings.maxMegabytes);
            }
            if (loader.settings.xmpp.reconnect) {
                _this.isReconnectEligible(loader.settings.xmpp.reconnectInterval);
            }
        }, 1 * 1000);
    }
    return AtmosXWireParser;
}());
exports.AtmosXWireParser = AtmosXWireParser;
module.exports = AtmosXWireParser;
