declare class mStanza {
    /**
      * @function validate
      * @description Validates an incoming XMPP stanza to determine if it contains relevant weather alert information.
      * If valid, it extracts and returns key details such as the message content, attributes, and alert type.
      *
      * @param {any} stanza - The incoming XMPP stanza to validate.
      * @param {any} isDebug - Optional parameter for debugging purposes. If provided, it treats the input as a debug object.
      *
      */
    static validate(stanza: any, isDebug?: any): {
        message: any;
        attributes: any;
        isDebug: any;
        isCap: any;
        hasCapDescription: any;
        hasVTEC: boolean;
        getAwipsType: string;
        ignore: boolean;
    } | {
        message: any;
        attributes: any;
        isCap: any;
        hasCapDescription: any;
        hasVTEC: boolean;
        getAwipsType: string;
        ignore: boolean;
        isDebug?: undefined;
    } | {
        ignore: boolean;
        message?: undefined;
        attributes?: undefined;
        isDebug?: undefined;
        isCap?: undefined;
        hasCapDescription?: undefined;
        hasVTEC?: undefined;
        getAwipsType?: undefined;
    };
    /**
      * @function getAwipsType
      * @description Determines the AWIPS type of a weather alert based on its attributes.
      * It checks the 'awipsid' attribute against known prefixes to classify the alert type.
      *
      * @param {any} attributes - The attributes of the weather alert stanza.
      */
    static getAwipsType(attributes: any): string;
    /**
      * @function create
      * @description Processes a validated weather alert stanza and triggers the appropriate event based on its type.
      *
      * @param {any} stanzaData - The validated weather alert stanza data.
      */
    static create(stanzaData: any): Promise<void>;
    /**
      * @function saveToCache
      * @description Saves the weather alert stanza to a cache file for record-keeping and debugging purposes.
      *
      * @param {any} stanzaData - The weather alert stanza data to be saved.
      */
    static saveToCache(stanzaData: any): void;
}

export { mStanza as default, mStanza };
