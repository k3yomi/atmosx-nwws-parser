declare class mTextParser {
    /**
      * @function getString
      * @description Extracts a substring from a message based on a specified starting string and optional removal patterns.
      *
      * @param {string} message - The full text message to search within.
      * @param {string} string - The starting string to look for in the message.
      * @param {Array|string|null} removal - Optional patterns (string or array of strings) to remove from the extracted substring.
      */
    static getString(message: string, string: string, removal?: any): string;
    /**
      * @function getEventCode
      * @description Extracts the event code from a weather alert message.
      *
      * @param {string} message - The full text message to search within.
      */
    static getForecastOffice(message: string): string;
    /**
      * @function getEventCode
      * @description Extracts the event code from a weather alert message.
      *
      * @param {string} message - The full text message to search within.
      */
    static getPolygonCoordinates(message: string): [number, number][];
    /**
      * @function getCleanDescription
      * @description Cleans the description text of a weather alert message by removing headers, footers, and extraneous information.
      *
      * @param {string} message - The full text message to clean.
      * @param {string} handle - The VTEC handle to help identify the start of the main content.
      */
    static getCleanDescription(message: string, handle: string): string;
}

export { mTextParser as default, mTextParser };
