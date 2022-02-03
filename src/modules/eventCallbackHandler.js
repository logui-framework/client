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
        let elementDOMProperties = Config.DOMProperties.get(browserEvent.currentTarget);

        // console.log("Event happened");
        // console.log(browserEvent.target);
        // console.log(browserEvent.currentTarget); // This may be the correct thing to use instead of .target - need to test this some more.
        // console.log(browserEvent.eventPhase);
        // console.log(elementDOMProperties);
        // console.log('=====');

        // This stops event propogation, preventing multiple events being fired.
        // After testing, this doesn't seem to break hovering over children where a listener is present...
        // browserEvent.stopPropagation();

        // stopPropogation() unfortunately also stops other bound event listeners not related to LogUI from firing.
        // Instead, we can check the eventPhase property of the event -- if we're at the target element (2), we can proceed.
        // If we are not at the target event (!=2) we do not proceed further with the logging process.
        // This should no longer be required (as of 2022-02-02) as we use currentTarget instead, alongside the check below to ensure that the object considered is covered by LogUI.
        // if (browserEvent.eventPhase != 2) {
        //     return;
        // }

        // Can we work out what the call is for, and check?
        // like if we have a click on green, and a click on body, the element itself takes precedence?
        // So if there are multiple ones, can we use CSS specificty to work out what one to take forward?

        if (!elementDOMProperties) {
            return;  // In this scenario, there is no matching DOMProperties object for the element.
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