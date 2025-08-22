# AtmosphericX - NOAA Weather Wire Service Parser


This repository contains the primary parser for AtmosphericX's NOAA Weather Wire Service parser. It is designed to handle real time weather alerts and messages from the National Weather Service using XMPP. If you do not know basic programming, this parser is not for you. It is intended for developers who want to integrate alerts from NOAA Weather Wire easily into their applications or services without hassle. If you wish to use NWWS without programming, feel free to use our project where most of this code was used - [AtmosphericX](https://github.com/k3yomi/AtmosphericX).

## Installation Guide
To install this package, you can use **NPM** (Node Package Manager). Open your terminal and run the following command:

```bash
npm install atmosx-nwws-parser
```

## Usage
```js
const AtmosXWireParser = require(`atmosx-nwws-parser`);
```

## Configuration and Initialization

There are several settings you can configure when intializing the parser. Below is the test.js example that shows some of the settings you can use:

```js
let Client = new AtmosXWireParser({
    alertSettings: { 
        onlyCap: false, // Set to true to only receive CAP messages only
        betterEvents: true, // Set to true to receive better event handling
        ugcPolygons: false, // Set to true to receive UGC Polygons instead of reading from raw products. 
        expiryCheck: true, // Set to true to check for expired alerts and remove them from the list
        filteredAlerts: [] // Alerts you want to only log, leave empty to receive all alerts (Ex. ["Tornado Warning", "Radar Indicated Tornado Warning"])
    },
    xmpp: {
        reconnect: true, // Set to true to enable automatic reconnection if you lose connection
        reconnectInterval: 60, // Interval in seconds to attempt reconnection
    },
    cacheSettings: {
        maxMegabytes: 2, // Maximum cache size in megabytes
        readCache: false, // Set to true if you wish to reupload the cache from earlier (Now supports reading from CAP, SPS, and Alerts)
        cacheDir: `./cache`, // Directory for cache files
    },
    authentication: {
        username: `USERNAME_HERE`, // Your XMPP username
        password: `PASSWORD_HERE`, // Your XMPP password
        display: `DISPLAY_NAME` // Display name for your XMPP client
    },
    database: `./database.db`, // Path to the SQLite database file (It will be created if it doesn't exist and will be used to store UGC counties and zones.)
});
```


## Event Handling

You can handle various events emitted by the parser. Here are some examples:

```js
Client.onEvent(`onAlert`, (alerts: Array) => {});
Client.onEvent(`onStormReport`, (report: Object) => {});
Client.onEvent(`onMesoscaleDiscussion`, (discussion: Object) => {});
Client.onEvent(`onMessage`, (stanza: Object) => {});
Client.onEvent(`onOccupant`, (occupant: Object) => {});
Client.onEvent(`onError`, (error: Object) => {});
Client.onEvent(`onReconnect`, (service: Object) => {});

```

## Functions and Methods
You can also use various functions provided by the parser. Here are some examples:
```js
// Debugging function to create your own alert manually
Client.forwardCustomStanza(stanza: String, attributes: Object);
```

```js
// Function to set the display name of the XMPP client (Will only set upon reconnect)
Client.setDisplayName(displayName: String);
```

## Error Handling
The parser can emit various errors. Here are some common errors you might encounter:

**not-authorized**: This error occurs when the parser is not authorized to connect to the XMPP server. Ensure that your username and password are correct.

**unreachable-host**: This error indicates that the parser cannot reach the XMPP server. Check your internet connection and ensure that the server address is correct.

**service-error**: This error occurs when there is an issue with the XMPP service. It could be due to server maintenance or other issues. You can try reconnecting after some time.

**no-database-dir**: This error occurs when the database directory does not exist. Ensure that the directory specified in the `database` setting exists or create it before running the parser.

## Credits
This parser is developed and maintained by [K3YOMI](https://github.com/K3YOMI) and the AtmosphericX Team. It is open-source and available for contributions and improvements. If you find any issues or have suggestions, feel free to open an issue or submit a pull request in the repository.
