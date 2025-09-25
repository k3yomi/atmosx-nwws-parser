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
exports.mEvents = void 0;
var loader = __importStar(require("../bootstrap"));
var text_parser_1 = __importDefault(require("./text-parser"));
var ugc_1 = __importDefault(require("./ugc"));
var vtec_1 = __importDefault(require("./vtec"));
var mEvents = /** @class */ (function () {
    function mEvents() {
    }
    /**
      * @function onEnhanced
      * @description Enhances the event name and tags of an alert object based on its description and parameters.
      *
      * @param {Object} event - The alert object to be enhanced.
      * @return {Object} - The enhanced alert object with updated event name and tags.
      * @example
      * Severe Thunderstorm Warning with "Considerable" damage threat becomes "Considerable Severe Thunderstorm Warning"
      */
    mEvents.onEnhanced = function (event) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        var tags = ['No tags found'];
        var eventName = (_b = (_a = event === null || event === void 0 ? void 0 : event.properties) === null || _a === void 0 ? void 0 : _a.event) !== null && _b !== void 0 ? _b : 'Unknown Event';
        var parameters = (_d = (_c = event === null || event === void 0 ? void 0 : event.properties) === null || _c === void 0 ? void 0 : _c.parameters) !== null && _d !== void 0 ? _d : {};
        var dmgThreat = (_h = (_f = (_e = parameters.thunderstormDamageThreat) === null || _e === void 0 ? void 0 : _e[0]) !== null && _f !== void 0 ? _f : (_g = parameters.tornadoDamageThreat) === null || _g === void 0 ? void 0 : _g[0]) !== null && _h !== void 0 ? _h : 'N/A';
        var torThreat = (_j = parameters.tornadoDetection) !== null && _j !== void 0 ? _j : 'N/A';
        var description = (_o = (_m = (_l = (_k = event === null || event === void 0 ? void 0 : event.properties) === null || _k === void 0 ? void 0 : _k.description) === null || _l === void 0 ? void 0 : _l.toLowerCase) === null || _m === void 0 ? void 0 : _m.call(_l)) !== null && _o !== void 0 ? _o : 'No description available.';
        if (description.includes('flash flood emergency') && eventName === 'Flash Flood Warning') {
            eventName = 'Flash Flood Emergency';
        }
        if (description.includes('particularly dangerous situation') && eventName === 'Tornado Warning' && dmgThreat === 'CONSIDERABLE') {
            eventName = 'PDS Tornado Warning';
        }
        if (description.includes('particularly dangerous situation') && eventName === 'Tornado Watch') {
            eventName = 'PDS Tornado Watch';
        }
        if (description.includes('extremely dangerous situation') && eventName === 'Severe Thunderstorm Warning') {
            eventName = 'EDS Severe Thunderstorm Warning';
        }
        if (description.includes('tornado emergency') && eventName === 'Tornado Warning' && dmgThreat === 'CATASTROPHIC') {
            eventName = 'Tornado Emergency';
        }
        if (eventName === 'Flash Flood Warning') {
            if (dmgThreat === 'CONSIDERABLE')
                eventName = 'Considerable Flash Flood Warning';
        }
        if (eventName === 'Tornado Warning') {
            eventName = 'Radar Indicated Tornado Warning';
            if (parameters.tornadoDetection === 'RADAR INDICATED')
                eventName = 'Radar Indicated Tornado Warning';
            if (parameters.tornadoDetection === 'OBSERVED')
                eventName = 'Confirmed Tornado Warning';
        }
        if (eventName === 'Severe Thunderstorm Warning') {
            if (dmgThreat === 'CONSIDERABLE')
                eventName = 'Considerable Severe Thunderstorm Warning';
            if (dmgThreat === 'DESTRUCTIVE')
                eventName = 'Destructive Severe Thunderstorm Warning';
            if (torThreat === 'POSSIBLE')
                eventName = "".concat(eventName, " (TPROB)");
        }
        for (var _i = 0, _p = Object.entries(loader.definitions.tags); _i < _p.length; _i++) {
            var _q = _p[_i], key = _q[0], value = _q[1];
            if (description.includes(key.toLowerCase())) {
                if (tags.includes('No tags found'))
                    tags = [];
                if (!tags.includes(value))
                    tags.push(value);
            }
        }
        return { eventName: eventName, tags: tags };
    };
    /**
      * @function onFinished
      * @description Processes and filters alert objects before emitting the 'onAlert' event. Based on settings, it can enhance event names, filter alerts, and check for expiry.
      *
      * @param {Array} alerts - An array of alert objects to be processed.
      *
      * @emits onAlert - Emitted when alerts are processed and ready.
      */
    mEvents.onFinished = function (alerts) {
        if (loader.settings.alertSettings.betterEvents) {
            for (var i = 0; i < alerts.length; i++) {
                var _a = this.onEnhanced(alerts[i]), eventName = _a.eventName, tags = _a.tags;
                alerts[i].properties.event = eventName;
                alerts[i].properties.tags = tags;
            }
        }
        if (loader.settings.alertSettings.filteredAlerts && Array.isArray(loader.settings.alertSettings.filteredAlerts) && loader.settings.alertSettings.filteredAlerts.length > 0) {
            var pSet_1 = new Set(loader.settings.alertSettings.filteredAlerts.map(function (p) { return String(p).toLowerCase(); }));
            alerts = alerts.filter(function (alert) { var _a, _b; return pSet_1.has(String((_b = (_a = alert === null || alert === void 0 ? void 0 : alert.properties) === null || _a === void 0 ? void 0 : _a.event) !== null && _b !== void 0 ? _b : '').toLowerCase()); });
        }
        if (loader.settings.alertSettings.expiryCheck) {
            alerts = alerts.filter(function (alert) { var _a; return new Date((_a = alert === null || alert === void 0 ? void 0 : alert.properties) === null || _a === void 0 ? void 0 : _a.expires) > new Date(); });
        }
        if (!alerts || alerts.length === 0) {
            return;
        }
        loader.statics.events.emit('onAlert', alerts);
    };
    /**
      * @function newCapAlerts
      * @description Emits the 'onAlert' event with parsed CAP alert objects. (XML Format)
      * The alert objects contain various properties such as id, tracking, action, area description, expiration time,
      * issue time, event type, sender information, description, geocode, and parameters like WMO identifier,
      * tornado detection, max hail size, max wind gust, and thunderstorm damage threat.
      *
      * @param {Object} stanza - The XMPP stanza containing the CAP alert message.
      *
      * @emits onAlert - Emitted when a new CAP alert is received and parsed.
      */
    mEvents.newCapAlerts = function (stanza) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, alerts, i, pStartTime, message, data, parsed, tracking, action, splitVTEC, getTimeIssued, alert_1;
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        messages = ((_a = stanza.message.match(/<\?xml[\s\S]*?<\/alert>/g)) === null || _a === void 0 ? void 0 : _a.map(function (xml) { return xml.trim(); })) || [];
                        alerts = [];
                        i = 0;
                        _l.label = 1;
                    case 1:
                        if (!(i < messages.length)) return [3 /*break*/, 4];
                        pStartTime = new Date().getTime();
                        message = messages[i].substring(messages[i].indexOf("<?xml version=\"1.0\""), messages[i].lastIndexOf(">") + 1);
                        data = new loader.packages.xml2js.Parser();
                        return [4 /*yield*/, data.parseStringPromise(message)];
                    case 2:
                        parsed = _l.sent();
                        tracking = ((_b = parsed.alert.info[0].parameter.find(function (p) { return p.valueName[0] === "VTEC"; })) === null || _b === void 0 ? void 0 : _b.value[0]) || "N/A";
                        action = "N/A";
                        if (tracking !== "N/A") {
                            splitVTEC = tracking.split(".");
                            tracking = "".concat(splitVTEC[2], "-").concat(splitVTEC[3], "-").concat(splitVTEC[4], "-").concat(splitVTEC[5]);
                            action = loader.definitions.status[splitVTEC[1]];
                        }
                        else {
                            action = parsed.alert.msgType[0];
                            tracking = "".concat((_c = parsed.alert.info[0].parameter.find(function (p) { return p.valueName[0] === "WMOidentifier"; })) === null || _c === void 0 ? void 0 : _c.value[0], "-").concat(parsed.alert.info[0].area[0].geocode.filter(function (g) { return g.valueName[0] === "UGC"; }).map(function (g) { return g.value[0]; }).join("-"));
                        }
                        getTimeIssued = new Date(stanza.attributes.issue);
                        if (getTimeIssued == "Invalid Date") {
                            getTimeIssued = new Date().getTime();
                        }
                        if (getTimeIssued != null) {
                            getTimeIssued = new Date(getTimeIssued).toLocaleString();
                        }
                        alert_1 = {
                            hitch: "".concat(new Date().getTime() - pStartTime, "ms"),
                            id: tracking,
                            tracking: tracking,
                            action: action,
                            history: [{ description: parsed.alert.info[0].description[0], action: action, issued: getTimeIssued }],
                            properties: {
                                areaDesc: parsed.alert.info[0].area[0].areaDesc[0],
                                expires: new Date(parsed.alert.info[0].expires[0]),
                                sent: new Date(parsed.alert.sent[0]),
                                messageType: action,
                                event: parsed.alert.info[0].event[0],
                                sender: parsed.alert.sender[0],
                                senderName: parsed.alert.info[0].senderName[0],
                                description: parsed.alert.info[0].description[0],
                                geocode: {
                                    UGC: parsed.alert.info[0].area[0].geocode.filter(function (g) { return g.valueName[0] === "UGC"; }).map(function (g) { return g.value[0]; })
                                },
                                parameters: {
                                    WMOidentifier: [((_d = parsed.alert.info[0].parameter.find(function (p) { return p.valueName[0] === "WMOidentifier"; })) === null || _d === void 0 ? void 0 : _d.value[0]) || "N/A"],
                                    tornadoDetection: ((_e = parsed.alert.info[0].parameter.find(function (p) { return p.valueName[0] === "tornadoDetection"; })) === null || _e === void 0 ? void 0 : _e.value[0]) || ((_f = parsed.alert.info[0].parameter.find(function (p) { return p.valueName[0] === "waterspoutDetection"; })) === null || _f === void 0 ? void 0 : _f.value[0]) || "N/A",
                                    maxHailSize: ((_g = parsed.alert.info[0].parameter.find(function (p) { return p.valueName[0] === "maxHailSize"; })) === null || _g === void 0 ? void 0 : _g.value[0]) || "N/A",
                                    maxWindGust: ((_h = parsed.alert.info[0].parameter.find(function (p) { return p.valueName[0] === "maxWindGust"; })) === null || _h === void 0 ? void 0 : _h.value[0]) || "N/A",
                                    thunderstormDamageThreat: [((_j = parsed.alert.info[0].parameter.find(function (p) { return p.valueName[0] === "thunderstormDamageThreat"; })) === null || _j === void 0 ? void 0 : _j.value[0]) || ((_k = parsed.alert.info[0].parameter.find(function (p) { return p.valueName[0] === "tornadoDamageThreat"; })) === null || _k === void 0 ? void 0 : _k.value[0]) || "N/A"]
                                }
                            }
                        };
                        if (parsed.alert.info[0].area[0].polygon) {
                            alert_1.geometry = {
                                type: "Polygon",
                                coordinates: [
                                    parsed.alert.info[0].area[0].polygon[0].split(" ").map(function (coord) {
                                        var _a = coord.split(",").map(parseFloat), lat = _a[0], lon = _a[1];
                                        return [lon, lat];
                                    })
                                ]
                            };
                        }
                        alerts.push(alert_1);
                        _l.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.onFinished(alerts);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
      * @function newRawAlerts
      * @description Emits the 'onAlert' event with parsed raw alert objects.
      * The alert objects contain various properties such as id, tracking, action, area description, expiration time,
      * issue time, event type, sender information, description, geocode, and parameters like WMO identifier,
      * tornado detection, max hail size, max wind gust, and thunderstorm damage threat.
      *
      * @param {Object} stanza - The XMPP stanza containing the raw alert message.
      *
      * @emits onAlert - Emitted when a new raw alert is received and parsed.
      */
    mEvents.newRawAlerts = function (stanza) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, defaultWMO, alerts, i, pStartTime, message, mVtec, mUgc, v, vtec, getTornado, getHailSize, getWindGusts, getDamageThreat, getForecastOffice, getPolygonCoordinates, getDescription, getTimeIssued, alert_2, ugcCoordinates;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        messages = stanza.message.split(/(?=\$\$)/g).map(function (msg) { return msg.trim(); });
                        defaultWMO = stanza.message.match(new RegExp(loader.definitions.expressions.wmo, 'gimu'));
                        alerts = [];
                        i = 0;
                        _b.label = 1;
                    case 1:
                        if (!(i < messages.length)) return [3 /*break*/, 5];
                        pStartTime = new Date().getTime();
                        message = messages[i];
                        return [4 /*yield*/, vtec_1.default.getVTEC(message, stanza.attributes)];
                    case 2:
                        mVtec = _b.sent();
                        return [4 /*yield*/, ugc_1.default.getUGC(message)];
                    case 3:
                        mUgc = _b.sent();
                        if (mVtec != null && mUgc != null) {
                            for (v = 0; v < mVtec.length; v++) {
                                vtec = mVtec[v];
                                if (vtec.wmo) {
                                    defaultWMO = vtec.wmo;
                                }
                                getTornado = text_parser_1.default.getString(message, "TORNADO...") || text_parser_1.default.getString(message, "WATERSPOUT...") || "N/A";
                                getHailSize = text_parser_1.default.getString(message, "MAX HAIL SIZE...", ["IN"]) || text_parser_1.default.getString(message, "HAIL...", ["IN"]) || "N/A";
                                getWindGusts = text_parser_1.default.getString(message, "MAX WIND GUST...") || text_parser_1.default.getString(message, "WIND...") || "N/A";
                                getDamageThreat = text_parser_1.default.getString(message, "DAMAGE THREAT...") || "N/A";
                                getForecastOffice = text_parser_1.default.getForecastOffice(message) || vtec.tracking.split("-")[0] || "NWS";
                                getPolygonCoordinates = text_parser_1.default.getPolygonCoordinates(message);
                                getDescription = text_parser_1.default.getCleanDescription(message, vtec.handle);
                                getTimeIssued = text_parser_1.default.getString(message, "ISSUED TIME...");
                                if (getTimeIssued == null) {
                                    getTimeIssued = new Date(stanza.attributes.issue).getTime();
                                }
                                if (getTimeIssued == null) {
                                    getTimeIssued = new Date().getTime();
                                }
                                if (getTimeIssued != null) {
                                    getTimeIssued = new Date(getTimeIssued).toLocaleString();
                                }
                                alert_2 = {
                                    hitch: "".concat(new Date().getTime() - pStartTime, "ms"),
                                    id: vtec.tracking,
                                    tracking: vtec.tracking,
                                    action: vtec.status,
                                    history: [{ description: getDescription, action: vtec.status, issued: getTimeIssued }],
                                    properties: {
                                        areaDesc: mUgc.locations.join("; ") || 'N/A',
                                        expires: isNaN(new Date(vtec.expires).getTime()) ? new Date(9999, 0, 1) : new Date(vtec.expires),
                                        sent: new Date(getTimeIssued),
                                        messageType: vtec.status,
                                        event: vtec.event || 'Unknown Event',
                                        sender: getForecastOffice,
                                        senderName: getForecastOffice,
                                        description: getDescription || 'No description available.',
                                        geocode: {
                                            UGC: mUgc.zones || [],
                                        },
                                        parameters: {
                                            WMOidentifier: ((_a = vtec.wmo) === null || _a === void 0 ? void 0 : _a[0]) ? [vtec.wmo[0]] : (defaultWMO === null || defaultWMO === void 0 ? void 0 : defaultWMO[0]) ? [defaultWMO[0]] : ["N/A"],
                                            tornadoDetection: getTornado,
                                            maxHailSize: getHailSize,
                                            maxWindGust: getWindGusts,
                                            thunderstormDamageThreat: [getDamageThreat],
                                        },
                                    },
                                    geometry: { type: 'Polygon', coordinates: [getPolygonCoordinates] }
                                };
                                if (loader.settings.alertSettings.ugcPolygons) {
                                    ugcCoordinates = ugc_1.default.getCoordinates(mUgc.zones);
                                    if (ugcCoordinates.length > 0) {
                                        alert_2.geometry = { type: 'Polygon', coordinates: [ugcCoordinates] };
                                    }
                                    ;
                                }
                                alerts.push(alert_2);
                            }
                        }
                        _b.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5:
                        this.onFinished(alerts);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
      * @function newSpecialWeatherStatement
      * @description Emits the 'onAlert' event with parsed special weather statement alert objects.
      * The alert objects contain various properties such as id, tracking, action, area description, expiration time,
      * issue time, event type, sender information, description, geocode, and parameters like WMO identifier,
      *
      * tornado detection, max hail size, max wind gust, and thunderstorm damage threat.
      *
      * @param {Object} stanza - The XMPP stanza containing the special weather statement message.
      *
      * @emits onAlert - Emitted when a new special weather statement is received and parsed.
      */
    mEvents.newSpecialWeatherStatement = function (stanza) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, defaultWMO, alerts, i, pStartTime, message, mUgc, getTornado, getHailSize, getWindGusts, getDamageThreat, getForecastOffice, getPolygonCoordinates, getDescription, getTimeIssued, alert_3, ugcCoordinates;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        messages = stanza.message.split(/(?=\$\$)/g).map(function (msg) { return msg.trim(); });
                        defaultWMO = stanza.message.match(new RegExp(loader.definitions.expressions.wmo, 'gimu'));
                        alerts = [];
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < messages.length)) return [3 /*break*/, 4];
                        pStartTime = new Date().getTime();
                        message = messages[i];
                        return [4 /*yield*/, ugc_1.default.getUGC(message)];
                    case 2:
                        mUgc = _a.sent();
                        if (mUgc != null) {
                            getTornado = text_parser_1.default.getString(message, "TORNADO...") || text_parser_1.default.getString(message, "WATERSPOUT...") || "N/A";
                            getHailSize = text_parser_1.default.getString(message, "MAX HAIL SIZE...", ["IN"]) || text_parser_1.default.getString(message, "HAIL...", ["IN"]) || "N/A";
                            getWindGusts = text_parser_1.default.getString(message, "MAX WIND GUST...") || text_parser_1.default.getString(message, "WIND...") || "N/A";
                            getDamageThreat = text_parser_1.default.getString(message, "DAMAGE THREAT...") || "N/A";
                            getForecastOffice = text_parser_1.default.getForecastOffice(message) || "NWS";
                            getPolygonCoordinates = text_parser_1.default.getPolygonCoordinates(message);
                            getDescription = text_parser_1.default.getCleanDescription(message, null);
                            getTimeIssued = text_parser_1.default.getString(message, "ISSUED TIME...");
                            if (getTimeIssued == null) {
                                getTimeIssued = new Date(stanza.attributes.issue).getTime();
                            }
                            if (getTimeIssued == null) {
                                getTimeIssued = new Date().getTime();
                            }
                            if (getTimeIssued != null) {
                                getTimeIssued = new Date(getTimeIssued).toLocaleString();
                            }
                            alert_3 = {
                                hitch: "".concat(new Date().getTime() - pStartTime, "ms"),
                                id: defaultWMO ? "".concat(defaultWMO[0], "-").concat(mUgc.zones.join("-")) : "N/A",
                                tracking: defaultWMO ? "".concat(defaultWMO[0], "-").concat(mUgc.zones.join("-")) : "N/A",
                                action: "Issued",
                                history: [{ description: getDescription, action: "Issued", issued: getTimeIssued }],
                                properties: {
                                    areaDesc: mUgc.locations.join("; ") || 'N/A',
                                    expires: new Date(new Date().getTime() + 1 * 60 * 60 * 1000),
                                    sent: new Date(getTimeIssued),
                                    messageType: "Issued",
                                    event: "Special Weather Statement",
                                    sender: getForecastOffice,
                                    senderName: getForecastOffice,
                                    description: getDescription || 'No description available.',
                                    geocode: {
                                        UGC: mUgc.zones || [],
                                    },
                                    parameters: {
                                        WMOidentifier: (defaultWMO === null || defaultWMO === void 0 ? void 0 : defaultWMO[0]) ? [defaultWMO[0]] : ["N/A"],
                                        tornadoDetection: getTornado,
                                        maxHailSize: getHailSize,
                                        maxWindGust: getWindGusts,
                                        thunderstormDamageThreat: [getDamageThreat],
                                    },
                                },
                                geometry: { type: 'Polygon', coordinates: [getPolygonCoordinates] }
                            };
                            if (loader.settings.alertSettings.ugcPolygons) {
                                ugcCoordinates = ugc_1.default.getCoordinates(mUgc.zones);
                                if (ugcCoordinates.length > 0) {
                                    alert_3.geometry = { type: 'Polygon', coordinates: [ugcCoordinates] };
                                }
                                ;
                            }
                            alerts.push(alert_3);
                        }
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.onFinished(alerts);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
      * @function newMesoscaleDiscussion
      * @description Emits the 'onMesoscaleDiscussion' event with a parsed mesoscale discussion alert object.
      * The alert object contains various properties such as id, tracking, action, area description, expiration time,
      * issue time, event type, sender information, description, geocode, and parameters like WMO identifier,
      * tornado intensity probability, peak wind gust, and peak hail size.
      *
      * @param {Object} stanza - The XMPP stanza containing the mesoscale discussion message.
      *
      * @emits onMesoscaleDiscussion - Emitted when a new mesoscale discussion is received and parsed.
      */
    mEvents.newMesoscaleDiscussion = function (stanza) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, defaultWMO, i, pStartTime, message, mUgc, getForecastOffice, getDescription, getTornadoIntensity, getPeakWindGust, getPeakHailSize, getTimeIssued, alert_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        messages = stanza.message.split(/(?=\$\$)/g).map(function (msg) { return msg.trim(); });
                        defaultWMO = stanza.message.match(new RegExp(loader.definitions.expressions.wmo, 'gimu'));
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < messages.length)) return [3 /*break*/, 4];
                        pStartTime = new Date().getTime();
                        message = messages[i];
                        return [4 /*yield*/, ugc_1.default.getUGC(message)];
                    case 2:
                        mUgc = _a.sent();
                        if (mUgc != null) {
                            getForecastOffice = text_parser_1.default.getForecastOffice(message) || "NWS";
                            getDescription = text_parser_1.default.getCleanDescription(message, null);
                            getTornadoIntensity = text_parser_1.default.getString(message, "MOST PROBABLE PEAK TORNADO INTENSITY...") || "N/A";
                            getPeakWindGust = text_parser_1.default.getString(message, "MOST PROBABLE PEAK WIND GUST...") || "N/A";
                            getPeakHailSize = text_parser_1.default.getString(message, "MOST PROBABLE PEAK HAIL SIZE...") || "N/A";
                            getTimeIssued = text_parser_1.default.getString(message, "ISSUED TIME...");
                            if (getTimeIssued == null) {
                                getTimeIssued = new Date(stanza.attributes.issue).getTime();
                            }
                            if (getTimeIssued == null) {
                                getTimeIssued = new Date().getTime();
                            }
                            if (getTimeIssued != null) {
                                getTimeIssued = new Date(getTimeIssued).toLocaleString();
                            }
                            alert_4 = {
                                hitch: "".concat(new Date().getTime() - pStartTime, "ms"),
                                id: defaultWMO ? "".concat(defaultWMO[0], "-").concat(mUgc.zones.join("-")) : "N/A",
                                tracking: defaultWMO ? "".concat(defaultWMO[0], "-").concat(mUgc.zones.join("-")) : "N/A",
                                action: "Issued",
                                history: [],
                                properties: {
                                    areaDesc: mUgc.locations.join("; ") || 'N/A',
                                    expires: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
                                    sent: new Date(getTimeIssued),
                                    messageType: "Issued",
                                    event: "Mesoscale Discussion",
                                    sender: getForecastOffice,
                                    senderName: getForecastOffice,
                                    description: getDescription || 'No description available.',
                                    geocode: {
                                        UGC: mUgc.zones || [],
                                    },
                                    parameters: {
                                        WMOidentifier: (defaultWMO === null || defaultWMO === void 0 ? void 0 : defaultWMO[0]) ? [defaultWMO[0]] : ["N/A"],
                                        tornadoIntensityProbability: getTornadoIntensity,
                                        peakWindGust: getPeakWindGust,
                                        peakHailSize: getPeakHailSize,
                                    },
                                }
                            };
                            loader.statics.events.emit('onMesoscaleDiscussion', alert_4);
                        }
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
      * @function newLocalStormReport
      * @description Emits the 'onLocalStormReport' event with the cleaned description of a local storm report. No other additional parsing is
      * done at this time at least.
      *
      * @param {Object} stanza - The XMPP stanza containing the local storm report message.
      *
      * @emits onLocalStormReport - Emitted when a new local storm report is received and parsed.
      */
    mEvents.newLocalStormReport = function (stanza) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                loader.statics.events.emit('onLocalStormReport', text_parser_1.default.getCleanDescription(stanza.message, null));
                return [2 /*return*/];
            });
        });
    };
    return mEvents;
}());
exports.mEvents = mEvents;
exports.default = mEvents;
