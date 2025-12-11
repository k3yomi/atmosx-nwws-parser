const { AlertManager } = require(`atmosx-nwws-parser`)


const parser = new AlertManager({ 
    database: `shapefile-manager.db`,
    is_wire: true,
    journal: true,
    noaa_weather_wire_service_settings: {
        reconnection_settings: {
            enabled: true,
            interval: 60,
        },
        credentials: {
            username: `username123`,
            password: `password123`,
            nickname: "AtmosphericX Standalone Parser",
        },   
        cache: {
            enabled: true,
            max_file_size: 5,
            max_db_history: 5000,
            directory: `cache`,
        },
        preferences: {
            disable_ugc: false,
            disable_vtec: false,
            disable_text: false,
            cap_only: false,
            shapefile_coordinates: false,
        }
    },
    national_weather_service_settings: {
        interval: 15,
        endpoint: `https://api.weather.gov/alerts/active`,
    },
    global_settings: {
        parent_events_only: true,
        better_event_parsing: true,
        filtering: {
            events: [`Severe Thunderstorm Warning`],
            filtered_icao: ["PAFC"],
            ignored_icao: [`KWNS`],
            ignored_events: [`Xx`, `Test Message`],
            ugc_filter: [],
            state_filter: [],
            check_expired: true,
            ignore_test_products: true,
            location: {
                unit: `miles`
            },
        },
        eas_settings: {
            directory: null,
            intro_wav: null,
        }
    }
})

parser.on(`onEvents`, (alerts) => {
   for (const alert of alerts) {
        if (alert.geometry != null) {
            console.log(`[${alert.properties.issued}] ${alert.properties.event} for ${alert.properties.locations} (ID: ${alert.details.tracking})`);
        }
    }
});