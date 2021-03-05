/*
    LogUI Client Library
    Event Handlers / Mouse Hover Group Event

    A IIFE function yielding a mouse hover event.

    @module: Mouse Hover Event Handler
    @author: David Maxwell
    @date: 2020-10-06
*/

import Config from '../config';

export default (function(root) {
    var _handler = {};

    _handler.browserEvents = ['mouseover', 'mouseout'];

    _handler.init = function() {
        return;
    };

    _handler.logUIEventCallback = function(eventContext, browserEvent, trackingConfig) {
        let customName = getEventName(trackingConfig, browserEvent.type);
        let returnObject = {
            type: browserEvent.type,
        };

        if (customName) {
            returnObject.name = customName;
        }
        
        if (shouldBlockEventBubbling(trackingConfig)) {
            if (!isParent(eventContext, browserEvent.relatedTarget) && browserEvent.target == eventContext) {
                return returnObject;
            }
        }
        else {
            return returnObject;
        }

        return false;
    };

    // Solution adapted from: https://gist.github.com/toruta39/3127081
    var isParent = function(refNode, otherNode) {
        if (!otherNode) {  // Added when the user switches desktop with the cursor in the same screen!
            return false;
        }

        var parent = otherNode.parentNode;

        do {
            if (refNode == parent) {
                return true;
            }
            else {
                parent = parent.parentNode;
            }
        } while (parent);

        return false;
    };

    var shouldBlockEventBubbling = function(trackingConfig) {
        let globalProperty = Config.browserEventsConfig.get('blockEventBubbling', true);
        let trackingConfigProperties = trackingConfig.properties;

        if (trackingConfigProperties && trackingConfigProperties.hasOwnProperty('blockEventBubbling')) {
            return trackingConfigProperties.blockEventBubbling;
        }

        return globalProperty;
    };

    var getEventName = function(trackingConfig, eventName) {
        let trackingConfigProperties = trackingConfig.properties;

        if (trackingConfigProperties &&
            trackingConfigProperties.hasOwnProperty(eventName) &&
            trackingConfigProperties[eventName].hasOwnProperty('name')) {
                return trackingConfigProperties[eventName].name;
        }

        return undefined;
    }

    return _handler;
})(window);

// For default handler, add in functionality for custom name.
// Add in functionality to parse metadata.

// Add in functionality for start and end events.