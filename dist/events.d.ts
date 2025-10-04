declare class mEvents {
    /**
      * @function onEnhanced
      * @description Enhances the event name and tags of an alert object based on its description and parameters.
      *
      * @param {Object} event - The alert object to be enhanced.
      * @return {Object} - The enhanced alert object with updated event name and tags.
      * @example
      * Severe Thunderstorm Warning with "Considerable" damage threat becomes "Considerable Severe Thunderstorm Warning"
      */
    static onEnhanced(event: any): {
        eventName: string;
        tags: string[];
    };
    /**
      * @function onFinished
      * @description Processes and filters alert objects before emitting the 'onAlert' event. Based on settings, it can enhance event names, filter alerts, and check for expiry.
      *
      * @param {Array} alerts - An array of alert objects to be processed.
      *
      * @emits onAlert - Emitted when alerts are processed and ready.
      */
    static onFinished(alerts: any): void;
    /**
      * @function newCapAlerts
      * @description Emits the 'onAlert' event with parsed CAP alert objects. (XML Format)
      * The alert objects contain various properties such as id, tracking, action, area description, expiration time,
      * issue time, event type, sender information, description, geocode, and parameters like WMO identifier,
      * tornado detection, max hail size, max wind gust, and thunderstorm damage threat.
      *
      * @param {Object} stanza - The XMPP stanza containing the CAP alert message.
      *
      * @emits onAlert - Emitted when a new CAP alert is received and parsed.
      */
    static newCapAlerts(stanza: any): Promise<void>;
    /**
      * @function newRawAlerts
      * @description Emits the 'onAlert' event with parsed raw alert objects.
      * The alert objects contain various properties such as id, tracking, action, area description, expiration time,
      * issue time, event type, sender information, description, geocode, and parameters like WMO identifier,
      * tornado detection, max hail size, max wind gust, and thunderstorm damage threat.
      *
      * @param {Object} stanza - The XMPP stanza containing the raw alert message.
      *
      * @emits onAlert - Emitted when a new raw alert is received and parsed.
      */
    static newRawAlerts(stanza: any): Promise<void>;
    /**
      * @function newUnknownAlert
      * @description Emits the 'onAlert' event with parsed unknown alert objects. (Non-CAP, Non-VTEC)
      * The alert objects contain various properties such as id, tracking, action, area description, expiration time,
      * issue time, event type, sender information, description, geocode, and parameters like WMO identifier,
      * tornado detection, max hail size, max wind gust, and thunderstorm damage threat.
      *
      * @param {Object} stanza - The XMPP stanza containing the raw alert message.
      *
      * @emits onAlert - Emitted when a new raw alert is received and parsed.
      */
    static newUnknownAlert(stanza: any): Promise<void>;
    /**
      * @function newSpecialWeatherStatement
      * @description Emits the 'onAlert' event with parsed special weather statement alert objects.
      * The alert objects contain various properties such as id, tracking, action, area description, expiration time,
      * issue time, event type, sender information, description, geocode, and parameters like WMO identifier,
      *
      * tornado detection, max hail size, max wind gust, and thunderstorm damage threat.
      *
      * @param {Object} stanza - The XMPP stanza containing the special weather statement message.
      *
      * @emits onAlert - Emitted when a new special weather statement is received and parsed.
      */
    static newSpecialWeatherStatement(stanza: any): Promise<void>;
    /**
      * @function newMesoscaleDiscussion
      * @description Emits the 'onMesoscaleDiscussion' event with a parsed mesoscale discussion alert object.
      * The alert object contains various properties such as id, tracking, action, area description, expiration time,
      * issue time, event type, sender information, description, geocode, and parameters like WMO identifier,
      * tornado intensity probability, peak wind gust, and peak hail size.
      *
      * @param {Object} stanza - The XMPP stanza containing the mesoscale discussion message.
      *
      * @emits onMesoscaleDiscussion - Emitted when a new mesoscale discussion is received and parsed.
      */
    static newMesoscaleDiscussion(stanza: any): Promise<void>;
    /**
      * @function newLocalStormReport
      * @description Emits the 'onLocalStormReport' event with the cleaned description of a local storm report. No other additional parsing is
      * done at this time at least.
      *
      * @param {Object} stanza - The XMPP stanza containing the local storm report message.
      *
      * @emits onLocalStormReport - Emitted when a new local storm report is received and parsed.
      */
    static newLocalStormReport(stanza: any): Promise<void>;
}

export { mEvents as default, mEvents };
