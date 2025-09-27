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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mStanza = void 0;
var loader = __importStar(require("../bootstrap"));
var events_1 = __importDefault(require("./events"));
var mStanza = /** @class */ (function () {
    function mStanza() {
    }
    /**
      * @function validate
      * @description Validates an incoming XMPP stanza to determine if it contains relevant weather alert information.
      * If valid, it extracts and returns key details such as the message content, attributes, and alert type.
      *
      * @param {any} stanza - The incoming XMPP stanza to validate.
      * @param {any} isDebug - Optional parameter for debugging purposes. If provided, it treats the input as a debug object.
      *
      */
    mStanza.validate = function (stanza, isDebug) {
        if (isDebug === void 0) { isDebug = false; }
        if (isDebug != false) {
            var message = stanza;
            var attributes = isDebug;
            var isCap = isDebug.isCap;
            var hasCapDescription = stanza.includes("<areaDesc>");
            var hasVTEC = stanza.match(loader.definitions.expressions.vtec) != null;
            var getAwipsType = this.getAwipsType(isDebug);
            return { message: message, attributes: attributes, isDebug: isDebug, isCap: isCap, hasCapDescription: hasCapDescription, hasVTEC: hasVTEC, getAwipsType: getAwipsType, ignore: false };
        }
        if (stanza.is("message")) {
            var cb = stanza.getChild("x");
            if (cb === null || cb === void 0 ? void 0 : cb.children) {
                var message = cb.children[0];
                var attributes = cb.attrs;
                var isCap = message.includes("<?xml version=\"1.0\"");
                var hasCapDescription = message.includes("<areaDesc>");
                var hasVTEC = message.match(loader.definitions.expressions.vtec) != null;
                var getAwipsType = this.getAwipsType(attributes);
                this.saveToCache({ message: message, attributes: attributes, isCap: isCap, hasVTEC: hasVTEC, getAwipsType: getAwipsType });
                return { message: message, attributes: attributes, isCap: isCap, hasCapDescription: hasCapDescription, hasVTEC: hasVTEC, getAwipsType: getAwipsType, ignore: false };
            }
        }
        return { ignore: true };
    };
    /**
      * @function getAwipsType
      * @description Determines the AWIPS type of a weather alert based on its attributes.
      * It checks the 'awipsid' attribute against known prefixes to classify the alert type.
      *
      * @param {any} attributes - The attributes of the weather alert stanza.
      */
    mStanza.getAwipsType = function (attributes) {
        if (!attributes || !attributes.awipsid)
            return "unknown";
        for (var _i = 0, _a = Object.entries(loader.definitions.awips); _i < _a.length; _i++) {
            var _b = _a[_i], prefix = _b[0], type = _b[1];
            if (attributes.awipsid.startsWith(prefix))
                return type;
        }
        return "default";
    };
    /**
      * @function create
      * @description Processes a validated weather alert stanza and triggers the appropriate event based on its type.
      *
      * @param {any} stanzaData - The validated weather alert stanza data.
      */
    mStanza.create = function (stanzaData) {
        if (stanzaData.getAwipsType == "default" && stanzaData.hasVTEC && stanzaData.isCap) {
            return events_1.default.newCapAlerts(stanzaData);
        } // Default alert - CAP Only
        if (stanzaData.getAwipsType == "default" && stanzaData.hasVTEC && !stanzaData.isCap) {
            return events_1.default.newRawAlerts(stanzaData);
        } // Default alert - NonCAP
        if (stanzaData.getAwipsType == "default" && !stanzaData.hasVTEC && !stanzaData.isCap) {
            return events_1.default.newUnknownAlert(stanzaData);
        } // Default alert - NonCAP, NonVTEC
        if (stanzaData.getAwipsType == "special-weather-statement") {
            return events_1.default.newSpecialWeatherStatement(stanzaData);
        } // SPW (Special Weather Statement)
        if (stanzaData.getAwipsType == "mesoscale-discussion") {
            return events_1.default.newMesoscaleDiscussion(stanzaData);
        } // MD (Mesoscale Discussion)
        if (stanzaData.getAwipsType == "local-storm-report") {
            return events_1.default.newLocalStormReport(stanzaData);
        } // LSR (Local Storm Report)
    };
    /**
      * @function saveToCache
      * @description Saves the weather alert stanza to a cache file for record-keeping and debugging purposes.
      *
      * @param {any} stanzaData - The weather alert stanza data to be saved.
      */
    mStanza.saveToCache = function (stanzaData) {
        if (!loader.settings.cacheSettings.cacheDir)
            return;
        stanzaData.message = stanzaData.message.replace(/\$\$/g, "\nISSUED TIME...".concat(new Date().toISOString(), "\n$$$\n"));
        loader.packages.fs.appendFileSync("".concat(loader.settings.cacheSettings.cacheDir, "/category-").concat(stanzaData.getAwipsType, "s-").concat(stanzaData.isCap ? "cap" : "raw").concat(stanzaData.hasVTEC ? "-vtec" : "", ".bin"), "=================================================\n".concat(new Date().toISOString().replace(/[:.]/g, '-'), "\n=================================================\n").concat(stanzaData.message), 'utf8');
    };
    return mStanza;
}());
exports.mStanza = mStanza;
exports.default = mStanza;
