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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mUgcParser = void 0;
var loader = __importStar(require("../bootstrap"));
var mUgcParser = /** @class */ (function () {
    function mUgcParser() {
    }
    /**
      * @function getUGC
      * @description Extracts UGC codes and associated locations from a weather alert message.
      *
      * @param {string} message - The full text message to search within.
      */
    mUgcParser.getUGC = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var header, zones, locations, ugc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        header = this.getHeader(message);
                        zones = this.getZones(header);
                        return [4 /*yield*/, this.getLocations(zones)];
                    case 1:
                        locations = _a.sent();
                        ugc = zones.length > 0 ? { zones: zones, locations: locations } : null;
                        return [2 /*return*/, ugc];
                }
            });
        });
    };
    /**
      * @function getHeader
      * @description Extracts the UGC header from a weather alert message.
      *
      * @param {string} message - The full text message to search within.
      */
    mUgcParser.getHeader = function (message) {
        var start = message.search(new RegExp(loader.definitions.expressions.ugc1, "gimu"));
        var end = message.substring(start).search(new RegExp(loader.definitions.expressions.ugc2, "gimu"));
        var full = message.substring(start, start + end).replace(/\s+/g, '').slice(0, -1);
        return full;
    };
    /**
      * @function getLocations
      * @description Retrieves location names from a database based on UGC zone codes.
      *
      * @param {Array} zones - An array of UGC zone codes.
      */
    mUgcParser.getLocations = function (zones) {
        return __awaiter(this, void 0, void 0, function () {
            var locations, i, id, statement, located;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locations = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < zones.length)) return [3 /*break*/, 4];
                        id = zones[i].trim();
                        statement = "SELECT location FROM shapefiles WHERE id = ?";
                        return [4 /*yield*/, loader.statics.db.prepare(statement).get(id)];
                    case 2:
                        located = _a.sent();
                        located != undefined ? locations.push(located.location) : locations.push(id);
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, Array.from(new Set(locations)).sort()];
                }
            });
        });
    };
    /**
      * @function getCoordinates
      * @description Retrieves geographical coordinates from a database based on UGC zone codes.
      *
      * @param {Array} zones - An array of UGC zone codes.
      */
    mUgcParser.getCoordinates = function (zones) {
        var coordinates = [];
        for (var i = 0; i < zones.length; i++) {
            var id = zones[i].trim();
            var statement = "SELECT geometry FROM shapefiles WHERE id = ?";
            var located = loader.statics.db.prepare(statement).get(id);
            if (located != undefined) {
                var geometry = JSON.parse(located.geometry);
                if ((geometry === null || geometry === void 0 ? void 0 : geometry.type) === 'Polygon') {
                    coordinates.push.apply(coordinates, geometry.coordinates[0].map(function (coord) { return [coord[0], coord[1]]; }));
                    break;
                }
            }
        }
        return coordinates;
    };
    /**
      * @function getZones
      * @description Parses the UGC header to extract individual UGC zone codes, handling ranges and formats.
      *
      * @param {string} header - The UGC header string.
      */
    mUgcParser.getZones = function (header) {
        var ugcSplit = header.split('-');
        var zones = [];
        var state = ugcSplit[0].substring(0, 2);
        var format = ugcSplit[0].substring(2, 3);
        for (var i = 0; i < ugcSplit.length; i++) {
            if (/^[A-Z]/.test(ugcSplit[i])) {
                state = ugcSplit[i].substring(0, 2);
                if (ugcSplit[i].includes('>')) {
                    var _a = ugcSplit[i].split('>'), start = _a[0], end = _a[1], startNum = parseInt(start.substring(3), 10), endNum = parseInt(end, 10);
                    for (var j = startNum; j <= endNum; j++)
                        zones.push("".concat(state).concat(format).concat(j.toString().padStart(3, '0')));
                }
                else
                    zones.push(ugcSplit[i]);
                continue;
            }
            if (ugcSplit[i].includes('>')) {
                var _b = ugcSplit[i].split('>'), start = _b[0], end = _b[1], startNum = parseInt(start, 10), endNum = parseInt(end, 10);
                for (var j = startNum; j <= endNum; j++)
                    zones.push("".concat(state).concat(format).concat(j.toString().padStart(3, '0')));
            }
            else
                zones.push("".concat(state).concat(format).concat(ugcSplit[i]));
        }
        return zones.filter(function (item) { return item !== ''; });
    };
    return mUgcParser;
}());
exports.mUgcParser = mUgcParser;
exports.default = mUgcParser;
