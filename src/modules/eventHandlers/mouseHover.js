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

    _handler.browserEvents = ['mouseenter', 'mouseleave'];

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
        
        return returnObject;
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