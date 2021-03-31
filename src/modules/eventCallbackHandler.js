/*
    LogUI Client Library
    Event Callback Handler Module

    An IIFE function returning functions for handling event callbacks associated with elements/events tracked under LogUI.

    @module: Event Callback Handler Module
    @author: David Maxwell
    @date: 2020-02-25
*/

import Config from './config';
import EventPackager from './eventPackager';
import EventHandlerController from './eventHandlerController';

export default (function(root) {
    var _public = {};

    _public.logUIEventCallback = function(browserEvent) {
        let elementDOMProperties = Config.DOMProperties.get(browserEvent.target);

        // This stops event propogation, preventing multiple events being fired.
        // After testing, this doesn't seem to break hovering over children where a listener is present...
        browserEvent.stopPropagation();

        // Can we work out what the call is for, and check?
        // like if we have a click on green, and a click on body, the element itself takes precedence?
        // So if there are multiple ones, can we use CSS specificty to work out what one to take forward?

        if (!elementDOMProperties) {
            return;  // In this scenario, there is no matching DOMProperties object for the element.
                     // This should not happen; this is placed as a safeguard to prevent the following from causing an exception.
        }

        let groupName = elementDOMProperties.getEventGroupName(browserEvent.type);
        let trackingConfig = Config.elementTrackingConfig.getElementGroup(groupName);
        let eventHandler = EventHandlerController.getEventHandler(trackingConfig.event);
        let packageEvent = false;

        if (eventHandler) {
            packageEvent = eventHandler.logUIEventCallback(this, browserEvent, trackingConfig);
        }
        else {
            packageEvent = _defaultEventCallbackHandler(this, browserEvent, trackingConfig);
        }

        if (packageEvent) {
            EventPackager.packageInteractionEvent(this, packageEvent, trackingConfig);
        }
    };

    var _defaultEventCallbackHandler = function(eventContext, browserEvent, trackingConfig) {
        let returnObject = {
            type: browserEvent.type,
        };

        if (trackingConfig.hasOwnProperty('name')) {
            returnObject.name = trackingConfig.name;
        }

        return returnObject;
    };

    return _public;
})(window);