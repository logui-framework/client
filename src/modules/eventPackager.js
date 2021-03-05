/*
    LogUI Client Library
    Event Packager Module

    An IIFE function returning the predispatching phase of LogUI.
    Handles the collection of data from a variety of sources, packages it up into an object, and sends it to the dispatcher.

    @module: Event Packager Module
    @author: David Maxwell
    @date: 2021-02-24
*/

import Config from './config';
import Dispatcher from '__dispatcherImportInPackager__';

export default (function(root) {
    var _public = {};

    _public.init = function() {
        root.addEventListener('logUIStarted', packageLogUIStartedEvent);

        return true;
    };

    _public.stop = function() {
        root.removeEventListener('logUIStarted', packageLogUIStartedEvent);
        packageLogUIStopEvent();
    };

    _public.packageInteractionEvent = function() {
        let toSend = {
            eventType: 'interaction',
            eventDetails: {
                type: 'some event',
            },
        };

        Dispatcher.sendObject(toSend);
        // metadata sourcer has to go here.
    };

    _public.packageBrowserEvent = function(eventDetails) {
        let packageObject = getBasicPackageObject();

        packageObject.eventType = 'browserEvent';
        packageObject.eventDetails = eventDetails;

        Dispatcher.sendObject(packageObject);
    };

    _public.packageStatusEvent = function(eventDetails) {

    };

    var packageLogUIStartedEvent = function(eventDetails) {
        let toSend = {
            eventType: 'started',
            eventDetails: {
                type: 'started logui',
            },
        };

        Dispatcher.sendObject(toSend);
    };

    var packageLogUIStopEvent = function() {
        let toSend = {
            eventType: 'stopped',
            eventDetails: {
                type: 'stopped logui',
            },
        };

        Dispatcher.sendObject(toSend);
    };

    var getBasicPackageObject = function() {
        let currentTimestamp = new Date();
        let sessionStartTimestamp = Config.sessionData.getSessionStartTimestamp();
        let libraryStartTimestamp = Config.sessionData.getLibraryStartTimestamp();
        
        return {
            eventType: null,
            eventDetails: {},
            timestamps: {
                eventTimestamp: currentTimestamp,
                sinceSessionStartMillis: currentTimestamp - sessionStartTimestamp,
                sinceLogUILoadMillis: currentTimestamp - libraryStartTimestamp,
            },
            applicationSpecificData: Config.getApplicationSpecificData(),
        }
    }

    return _public;
})(window);

// Now it is case of wrapping stuff up properly. We have timestamps.
// Metadata sourcers
// Dispatcher for websocket.