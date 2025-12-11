<h1 style='font-size: 65px'; align="center">🌪️ AtmosphericX - NOAA Wire + API Parser ⚠️</h1>
<div align="center">
  	<p align = "center">This repository contains the primary parser for AtmosphericX's NOAA Weather Wire Service (NWWS) and National Weather Service (NWS) API. It is designed to handle real-time weather alerts and messages from the National Weather Service, using both XMPP (NWWS) and direct API access (Slower). This parser is intended for developers who want to integrate real-time weather alerts, watches, warnings, and forecast data from the NWS seamlessly into their applications or services. It is not recommended for users without basic programming knowledge. If you wish to access NOAA weather data without programming, consider using our end-user project, which leverages this parser and provides an easy-to-use interface for tracking weather alerts.</small></p>
  	<p align = "center">Documentation written by @k3yomi</p>
	<div align="center" style="border: none;">
		<img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/k3yomi/atmosx-nwws-parser">
		<img alt="GitHub forks" src="https://img.shields.io/github/forks/k3yomi/atmosx-nwws-parser">
		<img alt="GitHub issues" src="https://img.shields.io/github/issues/k3yomi/atmosx-nwws-parser">
		<img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/k3yomi/atmosx-nwws-parser">
	</div>
</div>

## Installation (NPM)
```bash
npm install atmosx-nwws-parser
```

## Example Usage
```javascript
const { AlertManager } = require('atmosx-nwws-parser'); // CJS
import { AlertManager } from 'atmosx-nwws-parser'; // ESM

const parser = new AlertManager({
    database: `shapefiles.db`,
    is_wire: true,
    journal: true,
    noaa_weather_wire_service_settings: {
        reconnection_settings: {
            enabled: true,
            interval: 60,
        },
        credentials: {
            username: `username_here`,
            password: `password_here`,
            nickname: "AtmosphericX Parser",
        },   
        cache: {
            enabled: true,
            max_file_size: 5,
            max_db_history: 5000,
            directory: `meow`,
        },
        preferences: {
            disable_ugc: false,
            disable_vtec: false,
            disable_text: false,
            cap_only: false,
        }
    },
    national_weather_service_settings: {
        interval: 15,
        endpoint: `https://api.weather.gov/alerts/active`,
    },
    global_settings: {
        parent_events_only: true,
        better_event_parsing: true,
        shapefile_coordinates: false,
        shapefile_skip: 10,
        filtering: {
            events: [`Severe Thunderstorm Warning`],
            filtered_icao: [],
            ignored_icao: [`KWNS`],
            ignored_events: [`Xx`, `Test Message`],
            ugc_filter: [],
            state_filter: [],
            check_expired: true,
            ignore_text_products: true,
            location: {
                unit: `miles`
            },
        },
        eas_settings: {
            directory: null,
            intro_wav: null,
        }
    },
})
```

## NOAA Weather Wire Service (Getting Started)
To use the NOAA Weather Wire Service (NWWS). You would need to obtain credentials from the National Weather Service. Follow these steps:
1. Visit the [NOAA NWWS Registration Page](https://www.weather.gov/nwws/nwws_oi_request).
2. Fill out the registration form with the required information.
3. Submit the form and wait for approval. You will receive your NWWS credentials via email.

## Events and Listeners
> All events are in GeoJSON.

### Event `onEvents`
Triggered when a batch of new alerts are received and processed.
```javascript
parser.on(`onEvents`, (alerts) => {
    console.log(`Received ${alerts.length} new alerts.`);
    alerts.forEach(alert => {
        console.log(`${alert.properties.event} for ${alert.properties.locations}`);
    });
});
```
Alternatively, you can listen for single alert events using `onSevereThunderstormWarning` or `onTornadoWarning`, etc.
```javascript
parser.on(`onTornadoWarning`, (alert) => {
    console.log(`Tornado Warning issued for ${alert.properties.locations}`);
});
```

### Event `onReconnection`
Triggered when the parser attempts to reconnect to the NWWS service.
```javascript
parser.on(`onReconnection`, (data) => {
    console.log(`Reconnection attempt #${data.reconnects}`);
});
```

### Event `onConnection`
Triggered when the parser successfully connects to the NWWS service.
```javascript
parser.on(`onConnection`, (nickname) => {
    console.log(`Connected to NWWS service as ${nickname}`);
});
```

### Event `onOccupant`
Triggered when a new occupant is detected on the NWWS XMPP service.
```javascript
parser.on(`onOccupant`, (data) => {
    console.log(`New occupant detected: ${data.occupant}`);
});
```

### Event `onMessage`
Triggered when a stanza message is validated and received from the XMPP client.
```javascript
parser.on(`onMessage`, (data) => {
    console.log(`Message received from ${data.from}: ${data.message}`);
});
```

### Event `log`
Triggered for logging purposes, providing log level and message.
```javascript
parser.on(`log`, (message) => {
    console.log(data.message);
});
```

## Callbacks and Functions

### Function `setDisplayName(name)`
Sets the display name for the XMPP client. This requires reconnection to take effect.
```javascript
parser.setDisplayName(`My Weather Parser`);
```

### Function `setCurrentLocation(name, {latitude, longitude})`
Sets the current location for the parser, which can be used for location-based filtering.
```javascript
parser.setCurrentLocation(`My Location`, {34.05, -118.25 });
```

### Function `createEasAudio(description, header)`
Generates an EAS audio file based on the provided description and header. Audio file will be located based on settings provided in the global_settings.eas_settings object.
```javascript
parser.createEasAudio(`This is a test alert`, `EAS Header Info`);
```

### Function `getAllAlertTypes()`
Returns an array of all supported alert types by the parser.
```javascript
const alertTypes = parser.getAllAlertTypes();
console.log(alertTypes);
```

### Function `searchStanzaDatabase(query)`
Searches the internal stanza database for messages matching the provided query.
```javascript
const results = parser.searchStanzaDatabase(`Tornado Warning`);
console.log(results);
```

### Function `setSettings({})`
Dynamically updates the parser settings. Accepts the same configuration object as the constructor.
```javascript
parser.setSettings({
    global_settings: {
        filtering: {
            ignored_icao: [`KXYZ`],
        }
    }
});
```

### Function `stop()`
Stops the parser and disconnects from the NWWS service.
```javascript
parser.stop();
```

## References
- [NOAA NWWS Information](https://www.weather.gov/nwws/)
- [NWS API Documentation](https://www.weather.gov/documentation/services-web-api)
- [XMPP Protocol](https://xmpp.org/about/technology-overview/)
- [AtmosphericX](https://github.com/k3yomi/AtmosphericX)

## Acknowledgements
- [k3yomi](https://github.com/k3yomi)
    - Lead developer @ AtmosphericX and maintainer of this module.
- [StarflightWx](https://x.com/starflightVR)
    - For testing and providing feedback (Co-Developer and Spotter @ AtmosphericX)
