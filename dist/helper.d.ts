declare class AtmosXWireParser {
    packages: any;
    metadata: any;
    constructor(metadata: any);
    /**
      * @function initalizeDatabase
      * @description Initalizes the database and creates the shapefiles table if it does not exist.
      * Also imports shapefiles into the database if the table is created.
      *
      * @param {string} database - The path to the database file.
      */
    initalizeDatabase: (database: any) => Promise<void>;
    /**
      * @function initalizeClient
      * @description Initalizes the XMPP client and sets up event listeners.
      *
      * @param {object} metadata - The metadata object containing authentication information.
      */
    initalizeClient: (metadata: any) => void;
    /**
      * @function initalizeSession
      * @description Initalizes the XMPP session and sets up event listeners for connection, disconnection, errors, and incoming stanzas.
      *
      * @param {object} metadata - The metadata object containing authentication information.
      *
      * @emits onConnection - Emitted when the client successfully connects to the XMPP server.
      * @emits onStanza - Emitted when a valid stanza is received from the XMPP server.
      * @emits onError - Emitted when an error occurs.
      * @emits onReconnect - Emitted when the client attempts to reconnect to the XMPP server.
      * @throws Will throw an error if the database is not configured, if the client is reconnecting too fast, or if the connection to the XMPP server is lost.
      */
    initalizeSession: (metadata: any) => Promise<void>;
    /**
      * @function initalizeCache
      * @description Initalizes the cache by reading cached stanzas from files in the cache directory.
      * The function checks the alert settings to determine which files to read and processes each file by validating and creating stanzas.
      * If the cache directory is not set or reading from cache is disabled, the function returns without performing any actions.
      */
    initalizeCache: () => void;
    /**
      * @function errorHandler
      * @description Sets up a global error handler to catch uncaught exceptions and emit an 'onError' event with the error details.
      * The function checks if the error message matches any predefined halting conditions and includes the corresponding message and code in the emitted event.
      * This helps in logging and handling errors gracefully within the application.
      */
    errorHandler: () => void;
    /**
      * @function garabeCollector
      * @description Cleans up cache files in the specified cache directory that exceed the maximum allowed size.
      * The function traverses the cache directory and its subdirectories, checking the size of each file.
      * If a file exceeds the specified maximum size in megabytes, it is deleted.
      *
      * @param {number} maxMegabytes - The maximum allowed size for cache files in megabytes.
      */
    garabeCollector: (maxMegabytes: number) => void;
    /**
      * @function isReconnectEligible
      * @description Checks if the client is eligible to reconnect based on the specified interval.
      * If the client is not connected and the last stanza received was longer than the specified interval ago,
      * the function attempts to reconnect the client.
      *
      * @param {number} interval - The minimum interval in seconds between reconnection attempts.
      * @returns {object} An object containing the connection status and session information.
      */
    isReconnectEligible: (interval: number) => Promise<{
        message: string;
        isConnected: boolean;
        session: any;
    }>;
    /**
      * @function setDisplayName
      * @description Sets the display name for the XMPP session.
      *
      * @param {string} name - The display name to set for the session.
      */
    setDisplayName: (name: string) => Promise<void>;
    /**
      * @function onEvent
      * @description Registers an event listener for the specified event and returns a function to remove the listener.
      *
      * @param {string} event - The name of the event to listen for.
      * @param {function} callback - The callback function to execute when the event is emitted.
      * @returns {function} A function that removes the event listener when called.
      */
    onEvent: (event: string, callback: any) => () => void;
}

export { AtmosXWireParser, AtmosXWireParser as default };
