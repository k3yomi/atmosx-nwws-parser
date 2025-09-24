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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mVtecParser = void 0;
var loader = __importStar(require("../bootstrap"));
var mVtecParser = /** @class */ (function () {
    function mVtecParser() {
    }
    /**
      * @function getVTEC
      * @description Extracts VTEC information from a weather alert message.
      *
      * @param {string} message - The full text message to search within.
      * @param {object} attributes - Additional attributes such as issue time.
      */
    mVtecParser.getVTEC = function (message, attributes) {
        var vtecs = []; // Array to hold all VTEC objects (Alerts CAN have multiple VTECs so we need to account for that)
        var matches = message.match(new RegExp(loader.definitions.expressions.vtec, 'g'));
        if (!matches)
            return null; // No VTEC Found
        for (var i = 0; i < matches.length; i++) {
            var vtec = matches[i];
            var parts = vtec.split(".");
            var dates = parts[6].split("-");
            vtecs.push({
                handle: vtec,
                tracking: this.getTracking(parts),
                event: this.getEventName(parts),
                status: this.getEventStatus(parts),
                wmo: message.match(new RegExp(loader.definitions.expressions.wmo, 'gimu')),
                expires: this.getEventExpires(dates),
                issued: attributes.issue
            });
        }
        return vtecs;
    };
    /**
      * @function getTracking
      * @description Constructs a tracking code from VTEC parts.
      *
      * @param {Array} args - An array of VTEC parts.
      */
    mVtecParser.getTracking = function (args) {
        return "".concat(args[2], "-").concat(args[3], "-").concat(args[4], "-").concat(args[5]);
    };
    /**
      * @function getEventName
      * @description Constructs an event name from VTEC parts.
      *
      * @param {Array} args - An array of VTEC parts.
      */
    mVtecParser.getEventName = function (args) {
        return "".concat(loader.definitions.events[args[3]], " ").concat(loader.definitions.actions[args[4]]);
    };
    /**
      * @function getEventStatus
      * @description Retrieves the event status from VTEC parts.
      *
      * @param {Array} args - An array of VTEC parts.
      */
    mVtecParser.getEventStatus = function (args) {
        return loader.definitions.status[args[1]];
    };
    /**
      * @function getEventExpires
      * @description Constructs an expiration date-time string from VTEC date parts.
      *
      * @param {Array} args - An array containing the start and end date-time strings.
      */
    mVtecParser.getEventExpires = function (args) {
        if (args[1] == "000000T0000Z")
            return "Invalid Date Format";
        var expires = "".concat(new Date().getFullYear().toString().substring(0, 2)).concat(args[1].substring(0, 2), "-").concat(args[1].substring(2, 4), "-").concat(args[1].substring(4, 6), "T").concat(args[1].substring(7, 9), ":").concat(args[1].substring(9, 11), ":00");
        var local = new Date(new Date(expires).getTime() - 4 * 60 * 60000);
        var pad = function (n) { return n.toString().padStart(2, '0'); };
        return "".concat(local.getFullYear(), "-").concat(pad(local.getMonth() + 1), "-").concat(pad(local.getDate()), "T").concat(pad(local.getHours()), ":").concat(pad(local.getMinutes()), ":00.000-04:00");
    };
    return mVtecParser;
}());
exports.mVtecParser = mVtecParser;
exports.default = mVtecParser;
