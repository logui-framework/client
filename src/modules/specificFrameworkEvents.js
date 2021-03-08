/*
    LogUI Client Library
    Specific LogUI Framework Events Module

    An IIFE function returning functions for handling LogUI specific events.
    When fired, these functions gather the necessary data and send them to the relevant packager.

    @module: Specific LogUI Framework Events Module
    @author: David Maxwell
    @date: 2021-03-06
*/

import EventPackager from './eventPackager';

export default (function(root) {
    var _public = {};

    _public.init = function() {
        root.addEventListener('logUIStarted', _public.logUIStartedEvent);
        return true;
    };

    _public.stop = function() {
        root.removeEventListener('logUIStarted', _public.logUIStartedEvent);
        _public.logUIStoppedEvent();
    };

    _public.logUIStartedEvent = function() {
        let eventDetails = {
            type: 'started',
            browserAgentString: root.navigator.userAgent,
            screenResolution: {
                width: root.screen.width,
                height: root.screen.height,
                depth: root.screen.colorDepth,
            },
            viewportResolution: {
                width: root.innerWidth,
                height: root.innerHeight,
            },
        };

        EventPackager.packageStatusEvent(eventDetails);
    };

    _public.logUIStoppedEvent = function() {
        let eventDetails = {
            type: 'stopped',
        };

        EventPackager.packageStatusEvent(eventDetails);
    };

    _public.logUIUpdatedApplicationSpecificData = function() {
        EventPackager.packageStatusEvent({
            type: 'applicationSpecificDataUpdated',
        });
    };

    return _public;
})(window);