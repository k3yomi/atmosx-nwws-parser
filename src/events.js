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

let loader = require(`../bootstrap.js`);

class NoaaWeatherWireServiceEvents { 

    /**
      * @function onEnhanced
      * @description Enhances the event details based on the properties of the event.
      * 
      * @param {object} event - The event object containing properties to enhance.
      */

    onEnhanced = function(event) {
        let tags = [`No tags found`];
        let eventName = event.properties.event
        let dmgTheat = event.properties.parameters.thunderstormDamageThreat?.[0] || event.properties.parameters.tornadoDamageThreat?.[0] || `N/A`;
        let torThreat = event.properties.parameters.tornadoDetection || `N/A`;
        let description = event.properties.description.toLowerCase() || `No description available.`;
        if (description.includes(`flash flood emergency`) && eventName == `Flash Flood Warning`) eventName = `Flash Flood Emergency`;
        if (description.includes(`particularly dangerous situation`) && eventName == `Tornado Warning` && dmgTheat == `CONSIDERABLE`) eventName = `PDS Tornado Warning`;
        if (description.includes(`particularly dangerous situation`) && eventName == `Tornado Watch`) eventName = `PDS Tornado Watch`;
        if (description.includes(`extremely dangerous situation`) && eventName == `Severe Thunderstorm Warning`) eventName = `EDS Severe Thunderstorm Warning`;
        if (description.includes(`tornado emergency`) && eventName == `Tornado Warning` && dmgTheat == `CATASTROPHIC`) eventName = `Tornado Emergency`;

        if (eventName == `Tornado Warning`) {
            eventName = `Radar Indicated Tornado Warning`;
            if (event.properties.parameters.tornadoDetection == `RADAR INDICATED`) eventName = `Radar Indicated Tornado Warning`;
            if (event.properties.parameters.tornadoDetection == `OBSERVED`) eventName = `Confirmed Tornado Warning`; 
        }
        if (eventName == `Severe Thunderstorm Warning`) {
            if (dmgTheat == `CONSIDERABLE`) eventName = `Considerable Severe Thunderstorm Warning`;
            if (dmgTheat == `DESTRUCTIVE`) eventName = `Destructive Severe Thunderstorm Warning`;
            if (torThreat == `POSSIBLE`) eventName = `${eventName} (TPROB)`;
        }
        if (eventName == `Flash Flood Warning`) {
            if (dmgTheat == `CONSIDERABLE`) eventName = `Considerable Flash Flood Warning`;
        }
        for (let [key, value] of Object.entries(loader.definitions.tags)) {
            if (event.properties.description.toLowerCase().includes(key.toLowerCase())) {
                tags = tags.includes(`No tags found`) ? [] : tags;
                if (!tags.includes(value)) tags.push(value);
            }
        }
        return { event: eventName, tags: tags };
    }

    /**
      * @function onFinished
      * @description onFinishedes the alerts and emits an event with enhanced event details.
      * 
      * @param {Array} alerts - An array of alert objects to be onFinisheded.
      */ 

    onFinished = function(alerts) {
        if (loader.settings.alertSettings.betterEvents) { 
            for (let i = 0; i < alerts.length; i++) { 
                let {event, tags} = this.onEnhanced(alerts[i]);
                alerts[i].properties.event = event;
                alerts[i].properties.tags = tags;
            }
        }
        if (loader.settings.alertSettings.filteredAlerts && loader.settings.alertSettings.filteredAlerts.length > 0) {
            let pSet = new Set((loader.settings.alertSettings.filteredAlerts || []).map(p => String(p).toLowerCase()));
            alerts = alerts.filter(alert => pSet.has(String(alert.properties?.event || '').toLowerCase()));
        }
        if (loader.settings.alertSettings.expiryCheck) {
            alerts = alerts.filter(alert => 
                new Date(alert.properties.expires) > new Date()
            );
        }
        if (alerts.length === 0) { return; }
        loader.static.events.emit(`onAlert`, alerts);
    }

    /**
      * @function newCapEvent
      * @description Creates a new CAP event from the provided stanza.
      * 
      * @param {object} stanza - The stanza object containing message and attributes.
      */
    
    newCapEvent = async function(stanza) { 
        let message = stanza.message.match(/<\?xml[\s\S]*?<\/alert>/g) ?.map(xml => xml.trim()) || [];
        let alerts = []
        for (let msg of message) {
            msg = msg.substring(msg.indexOf(`<?xml version="1.0"`), msg.lastIndexOf(`>`) + 1);
            let data = loader.packages.xml2js.Parser();
            let result = await data.parseStringPromise(msg);
            let tracking = result.alert.info[0].parameter.find(p => p.valueName[0] == "VTEC")?.value[0] || "N/A";
            let action = "N/A";
            if (tracking !== "N/A") {
                let splitVTEC = tracking.split(".");
                tracking = `${splitVTEC[2]}-${splitVTEC[3]}-${splitVTEC[4]}-${splitVTEC[5]}`;
                action = loader.definitions.status[splitVTEC[1]];
            } else {
                action = result.alert.msgType[0];
                tracking = `${result.alert.info[0].parameter.find(p => p.valueName[0] == "WMOidentifier")?.value[0]}-${result.alert.info[0].area[0].geocode.filter(g => g.valueName[0] == "UGC").map(g => g.value[0]).join("-")}`;
            }
            let alert = {
                id: `Wire-${tracking}`,
                tracking: tracking,
                action: action,
                history: [{ description: result.alert.info[0].description[0], action: action, issued: new Date(stanza.attributes.issue) }],
                properties: {
                    areaDesc: result.alert.info[0].area[0].areaDesc[0],
                    expires: new Date(result.alert.info[0].expires[0]),
                    sent: new Date(result.alert.sent[0]),
                    messageType: action,
                    event: result.alert.info[0].event[0],
                    sender: result.alert.sender[0],
                    senderName: result.alert.info[0].senderName[0],
                    description: result.alert.info[0].description[0],
                    geocode: { UGC: result.alert.info[0].area[0].geocode.filter(g => g.valueName[0] == "UGC").map(g => g.value[0]) },
                    parameters: {
                        WMOidentifier: [result.alert.info[0].parameter.find(p => p.valueName[0] == "WMOidentifier")?.value[0] || "N/A"],
                        tornadoDetection: result.alert.info[0].parameter.find(p => p.valueName[0] == "tornadoDetection")?.value[0] || result.alert.info[0].parameter.find(p => p.valueName[0] == "waterspoutDetection")?.value[0] || "N/A",
                        maxHailSize: result.alert.info[0].parameter.find(p => p.valueName[0] == "maxHailSize")?.value[0] || "N/A",
                        maxWindGust: result.alert.info[0].parameter.find(p => p.valueName[0] == "maxWindGust")?.value[0] || "N/A",
                        thunderstormDamageThreat: [result.alert.info[0].parameter.find(p => p.valueName[0] == "thunderstormDamageThreat")?.value[0] || result.alert.info[0].parameter.find(p => p.valueName[0] == "tornadoDamageThreat")?.value[0] || "N/A"],
                    },
                },
            };
            if (result.alert.info[0].area[0].polygon) {
                alert.geometry = { type: "Polygon", coordinates: [result.alert.info[0].area[0].polygon[0].split(" ").map(coord => { let [lat, lon] = coord.split(",").map(parseFloat); return [lon, lat]; })] };
            }
            alerts.push(alert);
        }
        this.onFinished(alerts);
    }

    /**
      * @function newRawProductEvent
      * @description Creates a new raw product event from the provided stanza.
      *
      * @param {object} stanza - The stanza object containing message and attributes.
      */

    newRawProductEvent = async function(stanza) { 
        let message = stanza.message.split(/(?=\$\$)/g).map(msg => msg.trim());
        let defaultWMO = stanza.message.match(new RegExp(loader.definitions.expressions.wmo, 'gimu'));
        let alerts = []
        for (let msg of message) {
            let startTime = new Date().getTime();
            let mVtec = await loader.packages.mVtec.getVTEC(msg, stanza.attributes);
            let mUgc = await loader.packages.mUGC.getUGC(msg);
            if (mVtec && mUgc) {
                for (let i = 0; i < mVtec.length; i++) {
                    let vtec = mVtec[i];
                    if (vtec.wmo) defaultWMO = vtec.wmo;
                    let getTornado = loader.packages.mText.getString(msg, `TORNADO...`) || loader.packages.mText.getString(msg, `WATERSPOUT...`)
                    let getHail = loader.packages.mText.getString(msg, `MAX HAIL SIZE...`, [`IN`]) || loader.packages.mText.getString(msg, `HAIL...`, [`IN`]);
                    let getGusts = loader.packages.mText.getString(msg, `MAX WIND GUST...`) || loader.packages.mText.getString(msg, `WIND...`);
                    let getThreat = loader.packages.mText.getString(msg, `DAMAGE THREAT...`);
                    let timeIssued = loader.packages.mText.getString(msg, `ISSUED TIME...`);
                    if (timeIssued == null) { timeIssued = stanza.attributes.issue; }
                    let senderOffice = loader.packages.mText.getOffice(msg) || vtec.tracking.split(`-`)[0];
                    let getCoordinates = loader.packages.mText.getPolygonCoordinates(msg);
                    let getDescription = loader.packages.mText.getCleanDescription(msg, vtec);
                    let alert = { 
                        hitch: `${new Date().getTime() - startTime}ms`,
                        id: `Wire-${vtec.tracking}`,
                        tracking: vtec.tracking,
                        action: vtec.status,
                        history: [{description: getDescription, action: vtec.status, issued: new Date(timeIssued) == `Invalid Date` ? new Date(timeIssued) : timeIssued}],
                        properties: {
                            areaDesc: mUgc.locations.join(`; `) || `N/A`,
                            expires: new Date(vtec.expires) == `Invalid Date` ? new Date(9999, 0, 1) : new Date(vtec.expires),
                            sent: new Date(timeIssued),
                            messageType: vtec.status, 
                            event: vtec.event || `Unknown Event`,
                            sender: senderOffice,
                            senderName: `${senderOffice}`,
                            description: getDescription,
                            geocode: { 
                                UGC: mUgc.zones,
                            },
                            parameters: {
                                WMOidentifier: vtec.wmo?.[0] ? [vtec.wmo[0]] : defaultWMO?.[0] ? [defaultWMO[0]] : [`N/A`],
                                tornadoDetection: getTornado || `N/A`,
                                maxHailSize: getHail || `N/A`,
                                maxWindGust: getGusts || `N/A`,
                                thunderstormDamageThreat: [getThreat || `N/A`],
                            },
                        },
                        geometry: { type: `Polygon`, coordinates: [getCoordinates] }
                    }
                    if (loader.settings.alertSettings.ugcPolygons) {
                        let coordinates = await loader.packages.mUGC.getCoordinates(mUgc.zones);
                        if (coordinates.length > 0) {
                            alert.geometry.coordinates = [coordinates];
                        }
                    }
                    alerts.push(alert);
                }
            }
        }
        this.onFinished(alerts);
    }

    /**
      * @function newSpecialEvent
      * @description Creates a new special weather statement event from the provided stanza.
      * 
      * @param {object} stanza - The stanza object containing message and attributes.
      */

    newSpecialEvent = async function(stanza) { 
        let message = stanza.message.split(/(?=\$\$)/g).map(msg => msg.trim());
        let defaultWMO = stanza.message.match(new RegExp(loader.definitions.expressions.wmo, 'gimu'));
        let alerts = [];
        for (let msg of message) {
            let startTime = new Date().getTime();
            let mUgc = await loader.packages.mUGC.getUGC(msg);
            if (mUgc) {
                let getTornado = loader.packages.mText.getString(msg, `TORNADO...`) || loader.packages.mText.getString(msg, `WATERSPOUT...`)
                let getHail = loader.packages.mText.getString(msg, `MAX HAIL SIZE...`, [`IN`]) || loader.packages.mText.getString(msg, `HAIL...`, [`IN`]);
                let getGusts = loader.packages.mText.getString(msg, `MAX WIND GUST...`) || loader.packages.mText.getString(msg, `WIND...`);
                let getThreat = loader.packages.mText.getString(msg, `DAMAGE THREAT...`); 
                let senderOffice = loader.packages.mText.getOffice(msg) || `NWS`;
                let getCoordinates = loader.packages.mText.getPolygonCoordinates(msg);
                let getDescription = loader.packages.mText.getCleanDescription(msg, null);
                let timeIssued = loader.packages.mText.getString(msg, `ISSUED TIME...`);
                if (timeIssued == null) { timeIssued = stanza.attributes.issue; }
                let alert = { 
                    hitch: `${new Date().getTime() - startTime}ms`,
                    id: `Wire-${defaultWMO ? defaultWMO[0] : `N/A`}-${mUgc.zones.join(`-`)}`,
                    tracking: `${defaultWMO ? defaultWMO[0] : `N/A`}-${mUgc.zones.join(`-`)}`,
                    action: `Issued`,
                    history: [{description: getDescription, action: `Issued`, issued: new Date(timeIssued) == `Invalid Date` ? new Date(timeIssued) : timeIssued}],
                    properties: {
                        areaDesc: mUgc.locations.join(`; `) || `N/A`,
                        expires: new Date(new Date(timeIssued).getTime() + 1 * 60 * 60 * 1000),
                        sent: new Date(timeIssued),
                        messageType: `Issued`,
                        event: `Special Weather Statement`,
                        sender: senderOffice,
                        senderName: `${senderOffice}`,
                        description: getDescription,
                        geocode: { 
                            UGC: mUgc.zones,
                        },
                        parameters: {
                            WMOidentifier: defaultWMO?.[0] ? [defaultWMO[0]] : [`N/A`],
                            tornadoDetection: getTornado || `N/A`,
                            maxHailSize: getHail || `N/A`,
                            maxWindGust: getGusts || `N/A`,
                            thunderstormDamageThreat: [getThreat || `N/A`],
                        },
                    },
                    geometry: { type: `Polygon`, coordinates: [getCoordinates] }
                }
                if (loader.settings.alertSettings.ugcPolygons) {
                    let coordinates = await loader.packages.mUGC.getCoordinates(mUgc .zones);
                    if (coordinates.length > 0) {
                        alert.geometry.coordinates = [coordinates];
                    }
                }
                alerts.push(alert);
            }
        }
        this.onFinished(alerts);
    }

    /**
      * @function newMesoscaleDiscussion
      * @description Creates a new mesoscale discussion event from the provided stanza.
      *
      * @param {object} stanza - The stanza object containing message and attributes.
      */

    newMesoscaleDiscussion = async function(stanza) {
        let message = stanza.message.split(/(?=\$\$)/g).map(msg => msg.trim());
        let defaultWMO = stanza.message.match(new RegExp(loader.definitions.expressions.wmo, 'gimu'));
        for (let msg of message) {
            let startTime = new Date().getTime();
            let mUgc = await loader.packages.mUGC.getUGC(msg);
            if (mUgc) { 
                let senderOffice = loader.packages.mText.getOffice(msg) || `NWS`;
                let getDescription = loader.packages.mText.getCleanDescription(msg, null);
                let tornadoIntensityProbability = loader.packages.mText.getString(msg, `MOST PROBABLE PEAK TORNADO INTENSITY...`)
                let windIntensityProbability = loader.packages.mText.getString(msg, `MOST PROBABLE PEAK WIND GUST...`)
                let hailIntensityProbability = loader.packages.mText.getString(msg, `MOST PROBABLE PEAK HAIL SIZE...`)
                let alert = { 
                    hitch: `${new Date().getTime() - startTime}ms`,
                    id: `Wire-${defaultWMO ? defaultWMO[0] : `N/A`}-${mUgc.zones.join(`-`)}`,
                    tracking: `${defaultWMO ? defaultWMO[0] : `N/A`}-${mUgc.zones.join(`-`)}`,
                    action: `Issued`,
                    history: [],
                    properties: {
                        areaDesc: mUgc.locations.join(`; `) || `N/A`,
                        expires: new Date(new Date().getTime() + 1 * 60 * 60 * 1000),
                        sent: new Date(stanza.attributes.issue),
                        messageType: `Issued`,
                        event: `Mesoscale Discussion`,
                        sender: senderOffice,
                        senderName: `${senderOffice}`,
                        description: getDescription,
                        geocode: { 
                            UGC: mUgc.zones,
                        },
                        parameters: {
                            WMOidentifier: defaultWMO?.[0] ? [defaultWMO[0]] : [`N/A`],
                            tornadoIntensityProbability: tornadoIntensityProbability || `N/A`,
                            hailIntensityProbability: hailIntensityProbability || `N/A`,
                            windIntensityProbability: windIntensityProbability || `N/A`,
                        },
                    },
                }
                loader.static.events.emit(`onMesoscaleDiscussion`, alert);
            }
        }
    }

    /**
      * @function newStormReport
      * @description Creates a new storm report event from the provided stanza.
      * 
      * @param {object} stanza - The stanza object containing message and attributes.
      */ 

    newStormReport = async function(stanza) {
        loader.static.events.emit(`onStormReport`, loader.packages.mText.getCleanDescription(stanza.message, null));
    }

}

module.exports = new NoaaWeatherWireServiceEvents();