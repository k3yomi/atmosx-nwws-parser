declare class mUgcParser {
    /**
      * @function getUGC
      * @description Extracts UGC codes and associated locations from a weather alert message.
      *
      * @param {string} message - The full text message to search within.
      */
    static getUGC(message: string): Promise<{
        zones: string[];
        locations: string[];
        expiry: Date;
    }>;
    /**
      * @function getHeader
      * @description Extracts the UGC header from a weather alert message.
      *
      * @param {string} message - The full text message to search within.
      */
    static getHeader(message: string): string;
    static getExpiry(message: string): Date;
    /**
      * @function getLocations
      * @description Retrieves location names from a database based on UGC zone codes.
      *
      * @param {Array} zones - An array of UGC zone codes.
      */
    static getLocations(zones: any): Promise<string[]>;
    /**
      * @function getCoordinates
      * @description Retrieves geographical coordinates from a database based on UGC zone codes.
      *
      * @param {Array} zones - An array of UGC zone codes.
      */
    static getCoordinates(zones: any): [number, number][];
    /**
      * @function getZones
      * @description Parses the UGC header to extract individual UGC zone codes, handling ranges and formats.
      *
      * @param {string} header - The UGC header string.
      */
    static getZones(header: string): string[];
}

export { mUgcParser as default, mUgcParser };
