
AtmosXWireParser = require(`./dist/src/helper.js`)

let Client = new AtmosXWireParser.Parser({
    database: `./database.db`,
    authentication: {
        username: `YOUR_USERNAME`,
        password: `YOUR_PASSWORD`,
        display: `DISPLAY_NAME_HERE`, // Display name for the XMPP client
    },
    cacheSettings: {
        readCache: true, // Set to true if you wish to reupload the cache from earlier
        maxMegabytes: 5, // Maximum cache size in megabytes
        cacheDir: `./cache`, // Directory for cache files
    },
    alertSettings: { 
        onlyCap: false, // Set to true to only receive CAP messages only
        betterEvents: true, // Set to true to receive better event handling
        expiryCheck: true, // Set to true to filter out expired alerts
        ugcPolygons: false, // Set to true to receive UGC Polygons instead of reading from raw products. 
        filteredAlerts: [] // Alerts you want to only log, leave empty to receive all alerts
    },
    xmpp: {
        reconnect: true, // Set to true to enable automatic reconnection if you lose connection
        reconnectInterval: 60, // Interval in seconds to attempt reconnection
    },
});

Client.onEvent(`onAlert`, (alert) => {
    for (let a of alert) {
        console.log(`${a.properties.event} ${a.properties.messageType} ${a.tracking} - ${a.history[0].issued}`);
    }
})
Client.onEvent(`onStormReport`, (report) => {});
Client.onEvent(`onMesoscaleDiscussion`, (discussions) => {});
Client.onEvent(`onMessage`, (message) => {});
Client.onEvent(`onOccupant`, (occupant) => {});
Client.onEvent(`onError`, (error) => {console.log(error)});
Client.onEvent(`onReconnect`, (service) => {})
Client.onEvent(`onConnection`, (c) => {})

