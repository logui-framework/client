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
            EventPackager.packageInteractionEvent(packageEvent, trackingConfig);
        }
    };

    var _defaultEventCallbackHandler = function(eventContext, browserEvent, trackingConfig) {
        EventPackager.packageInteractionEvent({}, trackingConfig);
    };

    return _public;
})(window);


// After dinner, start thinking about the window-based events. resize, blur, etc.
// Can we adjust the config object to make this in their own bit?
// Do they need their own listener?

// in the packager, get the properties from the trackingConfig.
// implement basic metadata sourcing.