AtmosXWireParser = require(`./index.js`);

let Client = new AtmosXWireParser({
    alertSettings: { 
        onlyCap: false, // Set to true to only receive CAP messages only
        betterEvents: true, // Set to true to receive better event handling
        ugcPolygons: false, // Set to true to receive UGC Polygons instead of reading from raw products. 
        expiryCheck: true, // Set to true to filter out expired alerts
        filteredAlerts: [] // Alerts you want to only log, leave empty to receive all alerts (Ex. ["Tornado Warning", "Radar Indicated Tornado Warning"])
    },
    xmpp: {
        reconnect: true, // Set to true to enable automatic reconnection if you lose connection
        reconnectInterval: 60, // Interval in seconds to attempt reconnection
    },
    cacheSettings: {
        maxMegabytes: 2, // Maximum cache size in megabytes
        cacheDir: `./cache`, // Directory for cache files
        readCache: false, // Set to true if you wish to reupload the cache from earlier
    },
    authentication: {
        username: `USERNAME_HERE`, // Your XMPP username
        password: `PASSWORD_HERE`, // Your XMPP password
        display: `DISPLAY_NAME` // Display name for your XMPP client
    },
    database: `./database.db`, // Path to the SQLite database file (It will be created if it doesn't exist and will be used to store UGC counties and zones.)
});

Client.onEvent(`onAlert`, (alert) => {console.log(alert)});
Client.onEvent(`onStormReport`, (report) => {});
Client.onEvent(`onMesoscaleDiscussion`, (discussions) => {});
Client.onEvent(`onMessage`, (message) => {});
Client.onEvent(`onOccupant`, (occupant) => {});
Client.onEvent(`onError`, (error) => {console.log(error)});
Client.onEvent(`onReconnect`, (service) => { 
    Client.setDisplayName(`${username} (x${service.reconnects})`)
})