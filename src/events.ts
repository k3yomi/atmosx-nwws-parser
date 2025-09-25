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

import * as loader from '../bootstrap';
import mTextParser from './text-parser';
import mUgcParser from './ugc';
import mVtecParser from './vtec';


export class mEvents {

    /** 
      * @function onEnhanced
      * @description Enhances the event name and tags of an alert object based on its description and parameters.
      * 
      * @param {Object} event - The alert object to be enhanced.
      * @return {Object} - The enhanced alert object with updated event name and tags.
      * @example
      * Severe Thunderstorm Warning with "Considerable" damage threat becomes "Considerable Severe Thunderstorm Warning"
      */

    static onEnhanced (event: any) {
        let tags: string[] = ['No tags found'];
        let eventName: string = event?.properties?.event ?? 'Unknown Event';
        const parameters = event?.properties?.parameters ?? {};
        const dmgThreat: string = parameters.thunderstormDamageThreat?.[0] ?? parameters.tornadoDamageThreat?.[0] ?? 'N/A';
        const torThreat: string = parameters.tornadoDetection ?? 'N/A';
        const description: string = event?.properties?.description?.toLowerCase?.() ?? 'No description available.';
        if (description.includes('flash flood emergency') && eventName === 'Flash Flood Warning') { eventName = 'Flash Flood Emergency'; }
        if (description.includes('particularly dangerous situation') && eventName === 'Tornado Warning' && dmgThreat === 'CONSIDERABLE') { eventName = 'PDS Tornado Warning'; }
        if (description.includes('particularly dangerous situation') && eventName === 'Tornado Watch') { eventName = 'PDS Tornado Watch'; }
        if (description.includes('extremely dangerous situation') && eventName === 'Severe Thunderstorm Warning') { eventName = 'EDS Severe Thunderstorm Warning'; }
        if (description.includes('tornado emergency') && eventName === 'Tornado Warning' && dmgThreat === 'CATASTROPHIC') { eventName = 'Tornado Emergency'; }
        if (eventName === 'Flash Flood Warning') { if (dmgThreat === 'CONSIDERABLE') eventName = 'Considerable Flash Flood Warning'; }
        if (eventName === 'Tornado Warning') {
            eventName = 'Radar Indicated Tornado Warning';
            if (parameters.tornadoDetection === 'RADAR INDICATED') eventName = 'Radar Indicated Tornado Warning';
            if (parameters.tornadoDetection === 'OBSERVED') eventName = 'Confirmed Tornado Warning';
        }
        if (eventName === 'Severe Thunderstorm Warning') {
            if (dmgThreat === 'CONSIDERABLE') eventName = 'Considerable Severe Thunderstorm Warning';
            if (dmgThreat === 'DESTRUCTIVE') eventName = 'Destructive Severe Thunderstorm Warning';
            if (torThreat === 'POSSIBLE') eventName = `${eventName} (TPROB)`;
        }
        for (const [key, value] of Object.entries(loader.definitions.tags as Record<string, string>)) {
            if (description.includes(key.toLowerCase())) {
                if (tags.includes('No tags found')) tags = [];
                if (!tags.includes(value)) tags.push(value);
            }
        }
        return { eventName, tags };
    }

    /**
      * @function onFinished
      * @description Processes and filters alert objects before emitting the 'onAlert' event. Based on settings, it can enhance event names, filter alerts, and check for expiry.
      * 
      * @param {Array} alerts - An array of alert objects to be processed.
      * 
      * @emits onAlert - Emitted when alerts are processed and ready.
      */ 

    static onFinished (alerts: any) {
        if (loader.settings.alertSettings.betterEvents) { 
            for (let i = 0; i < alerts.length; i++) { 
                const { eventName, tags } = this.onEnhanced(alerts[i]);
                alerts[i].properties.event = eventName;
                alerts[i].properties.tags = tags;
            }
        }
        if ( loader.settings.alertSettings.filteredAlerts && Array.isArray(loader.settings.alertSettings.filteredAlerts) && loader.settings.alertSettings.filteredAlerts.length > 0 ) {
            const pSet = new Set((loader.settings.alertSettings.filteredAlerts as string[]).map(p => String(p).toLowerCase()));
            alerts = alerts.filter((alert: any) => pSet.has(String(alert?.properties?.event ?? '').toLowerCase()));
        }
        if (loader.settings.alertSettings.expiryCheck) {
            alerts = alerts.filter((alert: any) => new Date(alert?.properties?.expires) > new Date());
        }
        if (!alerts || alerts.length === 0) {
            return;
        }
        loader.statics.events.emit('onAlert', alerts);
    }

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

    static async newCapAlerts (stanza: any) {
        const messages = stanza.message.match(/<\?xml[\s\S]*?<\/alert>/g) ?.map(xml => xml.trim()) || [];
        let alerts: any[] = [];
        for (let i = 0; i < messages.length; i++) {
            const pStartTime = new Date().getTime();
            const message = messages[i].substring(messages[i].indexOf(`<?xml version="1.0"`), messages[i].lastIndexOf(`>`) + 1);
            let data = new loader.packages.xml2js.Parser();
            let parsed = await data.parseStringPromise(message);
            let tracking = parsed.alert.info[0].parameter.find((p: any) => p.valueName[0] === "VTEC")?.value[0] || "N/A";
            let action = "N/A";
            if (tracking !== "N/A") {
                let splitVTEC = tracking.split(".");
                tracking = `${splitVTEC[2]}-${splitVTEC[3]}-${splitVTEC[4]}-${splitVTEC[5]}`;
                action = loader.definitions.status[splitVTEC[1]];
            } else {
                action = parsed.alert.msgType[0];
                tracking = `${parsed.alert.info[0].parameter.find((p: any) => p.valueName[0] === "WMOidentifier")?.value[0]}-${parsed.alert.info[0].area[0].geocode.filter((g: any) => g.valueName[0] === "UGC").map((g: any) => g.value[0]).join("-")}`;
            }
            let getTimeIssued : any = new Date(stanza.attributes.issue);
            if (getTimeIssued == `Invalid Date`) { getTimeIssued = new Date().getTime(); }
            if (getTimeIssued != null) { getTimeIssued = new Date(getTimeIssued).toLocaleString(); }


            let alert: any = {
                hitch: `${new Date().getTime() - pStartTime}ms`,
                id: tracking,
                tracking: tracking,
                action: action,
                history: [{description: parsed.alert.info[0].description[0],action: action,issued: getTimeIssued}],
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
                        UGC: parsed.alert.info[0].area[0].geocode.filter((g: any) => g.valueName[0] === "UGC").map((g: any) => g.value[0])
                    },
                    parameters: {
                        WMOidentifier: [parsed.alert.info[0].parameter.find((p: any) => p.valueName[0] === "WMOidentifier")?.value[0] || "N/A"],
                        tornadoDetection: parsed.alert.info[0].parameter.find((p: any) => p.valueName[0] === "tornadoDetection")?.value[0] || parsed.alert.info[0].parameter.find((p: any) => p.valueName[0] === "waterspoutDetection")?.value[0] || "N/A",
                        maxHailSize: parsed.alert.info[0].parameter.find((p: any) => p.valueName[0] === "maxHailSize")?.value[0] || "N/A",
                        maxWindGust: parsed.alert.info[0].parameter.find((p: any) => p.valueName[0] === "maxWindGust")?.value[0] || "N/A",
                        thunderstormDamageThreat: [parsed.alert.info[0].parameter.find((p: any) => p.valueName[0] === "thunderstormDamageThreat")?.value[0] ||parsed.alert.info[0].parameter.find((p: any) => p.valueName[0] === "tornadoDamageThreat")?.value[0] ||"N/A"]
                    }
                }
            };
            if (parsed.alert.info[0].area[0].polygon) {
                alert.geometry = {
                    type: "Polygon",
                    coordinates: [
                        parsed.alert.info[0].area[0].polygon[0].split(" ").map((coord: string) => {
                            let [lat, lon] = coord.split(",").map(parseFloat);
                            return [lon, lat];
                        })
                    ]
                };
            }
            alerts.push(alert);
        }
        this.onFinished(alerts);
    }

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

    static async newRawAlerts (stanza: any) {
        const messages = stanza.message.split(/(?=\$\$)/g).map(msg => msg.trim());
        let defaultWMO = stanza.message.match(new RegExp(loader.definitions.expressions.wmo, 'gimu'));
        let alerts: any[] = [];
        for (let i = 0; i < messages.length; i++) {
            const pStartTime = new Date().getTime()
            const message = messages[i];
            const mVtec = await mVtecParser.getVTEC(message, stanza.attributes);
            const mUgc = await mUgcParser.getUGC(message);
            if (mVtec != null && mUgc != null) {
                for (let v = 0; v < mVtec.length; v++) {
                    let vtec = mVtec[v];
                    if (vtec.wmo) { defaultWMO = vtec.wmo; }
                    const getTornado = mTextParser.getString(message, `TORNADO...`) || mTextParser.getString(message, `WATERSPOUT...`) || `N/A`;
                    const getHailSize = mTextParser.getString(message, `MAX HAIL SIZE...`, [`IN`]) || mTextParser.getString(message, `HAIL...`, [`IN`]) || `N/A`;
                    const getWindGusts = mTextParser.getString(message, `MAX WIND GUST...`) || mTextParser.getString(message, `WIND...`) || `N/A`;
                    const getDamageThreat = mTextParser.getString(message, `DAMAGE THREAT...`) || `N/A`;
                    const getForecastOffice = mTextParser.getForecastOffice(message) || vtec.tracking.split(`-`)[0] || `NWS`;
                    const getPolygonCoordinates = mTextParser.getPolygonCoordinates(message);
                    const getDescription = mTextParser.getCleanDescription(message, vtec.handle);
                    let getTimeIssued : any = mTextParser.getString(message, `ISSUED TIME...`) 
                    if (getTimeIssued == null) { getTimeIssued = new Date(stanza.attributes.issue).getTime(); }
                    if (getTimeIssued == null) { getTimeIssued = new Date().getTime(); }
                    if (getTimeIssued != null) { getTimeIssued = new Date(getTimeIssued).toLocaleString(); }
                    let alert = {
                        hitch: `${new Date().getTime() - pStartTime}ms`,
                        id: vtec.tracking,
                        tracking: vtec.tracking,
                        action: vtec.status,
                        history: [{description: getDescription, action: vtec.status, issued: getTimeIssued}],
                        properties: {
                            areaDesc: mUgc.locations.join(`; `) || 'N/A',
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
                                WMOidentifier: vtec.wmo?.[0] ? [vtec.wmo[0]] : defaultWMO?.[0] ? [defaultWMO[0]] : [`N/A`],
                                tornadoDetection: getTornado,
                                maxHailSize: getHailSize,
                                maxWindGust: getWindGusts,
                                thunderstormDamageThreat: [getDamageThreat],
                            },
                        },
                        geometry: { type: 'Polygon', coordinates: [getPolygonCoordinates] }
                    };
                    if (loader.settings.alertSettings.ugcPolygons) {
                        const ugcCoordinates = mUgcParser.getCoordinates(mUgc.zones);
                        if (ugcCoordinates.length > 0) { alert.geometry = { type: 'Polygon', coordinates: [ugcCoordinates] }; };
                    }
                    alerts.push(alert);
                }
            }
        }
        this.onFinished(alerts);
    }

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

    static async newSpecialWeatherStatement (stanza: any) {
        const messages = stanza.message.split(/(?=\$\$)/g).map(msg => msg.trim());
        let defaultWMO = stanza.message.match(new RegExp(loader.definitions.expressions.wmo, 'gimu'));
        let alerts: any[] = [];
        for (let i = 0; i < messages.length; i++) {
            const pStartTime = new Date().getTime()
            const message = messages[i];
            const mUgc = await mUgcParser.getUGC(message);
            if (mUgc != null) {
                const getTornado = mTextParser.getString(message, `TORNADO...`) || mTextParser.getString(message, `WATERSPOUT...`) || `N/A`;
                const getHailSize = mTextParser.getString(message, `MAX HAIL SIZE...`, [`IN`]) || mTextParser.getString(message, `HAIL...`, [`IN`]) || `N/A`;
                const getWindGusts = mTextParser.getString(message, `MAX WIND GUST...`) || mTextParser.getString(message, `WIND...`) || `N/A`;
                const getDamageThreat = mTextParser.getString(message, `DAMAGE THREAT...`) || `N/A`;
                const getForecastOffice = mTextParser.getForecastOffice(message) || `NWS`;
                const getPolygonCoordinates = mTextParser.getPolygonCoordinates(message);
                const getDescription = mTextParser.getCleanDescription(message, null);
                let getTimeIssued : any = mTextParser.getString(message, `ISSUED TIME...`) 
                if (getTimeIssued == null) { getTimeIssued = new Date(stanza.attributes.issue).getTime(); }
                if (getTimeIssued == null) { getTimeIssued = new Date().getTime(); }
                if (getTimeIssued != null) { getTimeIssued = new Date(getTimeIssued).toLocaleString(); }
                let alert = {
                    hitch: `${new Date().getTime() - pStartTime}ms`,
                    id: defaultWMO ? `${defaultWMO[0]}-${mUgc.zones.join(`-`)}` : `N/A`,
                    tracking: defaultWMO ? `${defaultWMO[0]}-${mUgc.zones.join(`-`)}` : `N/A`,
                    action: `Issued`,
                    history: [{description: getDescription, action: `Issued`, issued: getTimeIssued}],
                    properties: {
                        areaDesc: mUgc.locations.join(`; `) || 'N/A',
                        expires: new Date(new Date().getTime() + 1 * 60 * 60 * 1000),
                        sent: new Date(getTimeIssued),
                        messageType: `Issued`,
                        event: `Special Weather Statement`,
                        sender: getForecastOffice,
                        senderName: getForecastOffice,
                        description: getDescription || 'No description available.',
                        geocode: {
                            UGC: mUgc.zones || [],
                        },
                        parameters: {
                            WMOidentifier: defaultWMO?.[0] ? [defaultWMO[0]] : [`N/A`],
                            tornadoDetection: getTornado,
                            maxHailSize: getHailSize,
                            maxWindGust: getWindGusts,
                            thunderstormDamageThreat: [getDamageThreat],
                        },
                    },
                    geometry: { type: 'Polygon', coordinates: [getPolygonCoordinates] }
                };
                if (loader.settings.alertSettings.ugcPolygons) {
                    const ugcCoordinates = mUgcParser.getCoordinates(mUgc.zones);
                    if (ugcCoordinates.length > 0) { alert.geometry = { type: 'Polygon', coordinates: [ugcCoordinates] }; };
                }
                alerts.push(alert);
            }
        }
        this.onFinished(alerts);
    }

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

    static async newMesoscaleDiscussion (stanza: any) {
        const messages = stanza.message.split(/(?=\$\$)/g).map(msg => msg.trim());
        let defaultWMO = stanza.message.match(new RegExp(loader.definitions.expressions.wmo, 'gimu'));
        for (let i = 0; i < messages.length; i++) {
            const pStartTime = new Date().getTime()
            const message = messages[i];
            const mUgc = await mUgcParser.getUGC(message);
            if (mUgc != null) {
                const getForecastOffice = mTextParser.getForecastOffice(message) || `NWS`;
                const getDescription = mTextParser.getCleanDescription(message, null);
                const getTornadoIntensity = mTextParser.getString(message, `MOST PROBABLE PEAK TORNADO INTENSITY...`) || `N/A`;
                const getPeakWindGust = mTextParser.getString(message, `MOST PROBABLE PEAK WIND GUST...`) || `N/A`;
                const getPeakHailSize = mTextParser.getString(message, `MOST PROBABLE PEAK HAIL SIZE...`) || `N/A`;
                let getTimeIssued : any = mTextParser.getString(message, `ISSUED TIME...`) 
                if (getTimeIssued == null) { getTimeIssued = new Date(stanza.attributes.issue).getTime(); }
                if (getTimeIssued == null) { getTimeIssued = new Date().getTime(); }
                if (getTimeIssued != null) { getTimeIssued = new Date(getTimeIssued).toLocaleString(); }
                let alert = {
                    hitch: `${new Date().getTime() - pStartTime}ms`,
                    id: defaultWMO ? `${defaultWMO[0]}-${mUgc.zones.join(`-`)}` : `N/A`,
                    tracking: defaultWMO ? `${defaultWMO[0]}-${mUgc.zones.join(`-`)}` : `N/A`,
                    action: `Issued`,
                    history: [],
                    properties: {
                        areaDesc: mUgc.locations.join(`; `) || 'N/A',
                        expires: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
                        sent: new Date(getTimeIssued),
                        messageType: `Issued`,
                        event: `Mesoscale Discussion`,
                        sender: getForecastOffice,
                        senderName: getForecastOffice,
                        description: getDescription || 'No description available.',
                        geocode: {
                            UGC: mUgc.zones || [],
                        },
                        parameters: {
                            WMOidentifier: defaultWMO?.[0] ? [defaultWMO[0]] : [`N/A`],
                            tornadoIntensityProbability: getTornadoIntensity,
                            peakWindGust: getPeakWindGust,
                            peakHailSize: getPeakHailSize,
                        },
                    }
                };
                loader.statics.events.emit('onMesoscaleDiscussion', alert);
            }
        }
    }

    /**
      * @function newLocalStormReport
      * @description Emits the 'onLocalStormReport' event with the cleaned description of a local storm report. No other additional parsing is 
      * done at this time at least.
      * 
      * @param {Object} stanza - The XMPP stanza containing the local storm report message.
      * 
      * @emits onLocalStormReport - Emitted when a new local storm report is received and parsed.
      */

    static async newLocalStormReport (stanza: any) {
        loader.statics.events.emit('onLocalStormReport', mTextParser.getCleanDescription(stanza.message, null));
    }
}

export default mEvents;

