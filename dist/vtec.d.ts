declare class mVtecParser {
    /**
      * @function getVTEC
      * @description Extracts VTEC information from a weather alert message.
      *
      * @param {string} message - The full text message to search within.
      * @param {object} attributes - Additional attributes such as issue time.
      */
    static getVTEC(message: string, attributes: any): any[];
    /**
      * @function getTracking
      * @description Constructs a tracking code from VTEC parts.
      *
      * @param {Array} args - An array of VTEC parts.
      */
    static getTracking(args: any): string;
    /**
      * @function getEventName
      * @description Constructs an event name from VTEC parts.
      *
      * @param {Array} args - An array of VTEC parts.
      */
    static getEventName(args: any): string;
    /**
      * @function getEventStatus
      * @description Retrieves the event status from VTEC parts.
      *
      * @param {Array} args - An array of VTEC parts.
      */
    static getEventStatus(args: any): any;
    /**
      * @function getEventExpires
      * @description Constructs an expiration date-time string from VTEC date parts.
      *
      * @param {Array} args - An array containing the start and end date-time strings.
      */
    static getEventExpires(args: any): string;
}

export { mVtecParser as default, mVtecParser };
