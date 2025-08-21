/*
                                            _               _     __   __
         /\  | |                           | |             (_)    \ \ / /
        /  \ | |_ _ __ ___   ___  ___ _ __ | |__   ___ _ __ _  ___ \ V / 
       / /\ \| __| '_ ` _ \ / _ \/ __| '_ \| '_ \ / _ \ '__| |/ __| > <  
      / ____ \ |_| | | | | | (_) \__ \ |_) | | | |  __/ |  | | (__ / . \ 
     /_/    \_\__|_| |_| |_|\___/|___/ .__/|_| |_|\___|_|  |_|\___/_/ \_\
                                     | |                                 
                                     |_|                                                                                                                
    
    Written by: k3yomi@GitHub                        
*/

let loader = require(`../bootstrap.js`);

class NoaaWeatherWireServiceVtec { 

    /**
      * @function getVTEC
      * @description Extracts VTEC information from a message and its attributes.
      * @param {string} message - The message containing VTEC information.
      * @param {object} attributes - The attributes of the message.
      */

    getVTEC = function(message, attributes) {
		let matches = message.match(new RegExp(loader.definitions.expressions.vtec, 'g'));
		if (!matches) return null;
		let vtecs = matches.map(match => {
			let splitVTEC = match.split(`.`);
			let vtecDates = splitVTEC[6].split(`-`);
			return {
				raw: match,
				tracking: this.getTrackingIdentifier(splitVTEC),
				event: this.getEventName(splitVTEC),
				status: this.getEventStatus(splitVTEC),
				wmo: message.match(new RegExp(loader.definitions.expressions.wmo, 'gimu')),
				expires: this.getExpires(vtecDates),
				issued: attributes.issue 
			};
		});
      	return vtecs;
    }

    /**
      * @function getTrackingIdentifier
      * @description Constructs a tracking identifier from the VTEC components.
      * @param {Array} args - The components of the VTEC string.
      */

    getTrackingIdentifier = function(args) {
        return `${args[2]}-${args[3]}-${args[4]}-${args[5]}`;
    }

    /**
      * @function getEventName
      * @description Constructs a an event name from the VTEC components.
      * @param {Array} args - The components of the VTEC string.
      */

    getEventName = function(args) { 
        return `${loader.definitions.events[args[3]]} ${loader.definitions.actions[args[4]]}`;
    }

    /**
      * @function getEventStatus
      * @description Retrieves the status of the event from the VTEC components. (Issued, Updated, Extended, etc.)
      * @param {Array} args - The components of the VTEC string.
      */

    getEventStatus = function(args) { 
        return loader.definitions.status[args[1]]
    }

    /**
      * @function getExpires
      * @description Converts the VTEC expiration date into a standardized format.
      * @param {Array} args - The components of the VTEC string.
      */
    
    getExpires = function(args) {
		if (args[1] == `000000T0000Z`) return `Invalid Date Format`;
		let expires = `${new Date().getFullYear().toString().substring(0, 2)}${args[1].substring(0, 2)}-${args[1].substring(2, 4)}-${args[1].substring(4, 6)}T${args[1].substring(7, 9)}:${args[1].substring(9, 11)}:00`;
		let local = new Date(new Date(expires).getTime() - 4 * 60 * 60000);
		let pad = n => n.toString().padStart(2, '0');
		return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}:00.000-04:00`;
    }
}

module.exports = new NoaaWeatherWireServiceVtec();