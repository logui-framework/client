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
        Dispatcher.sendObject({hello: 'world'});
        // metadata sourcer has to go here.
    };

    _public.packageBrowserEvent = function(eventDetails) {
        let packageObject = getBasicPackageObject();

        packageObject.eventType = 'browserEvent';
        packageObject.eventDetails = eventDetails;

        console.log(packageObject);
    };

    _public.packageStatusEvent = function() {

    };

    var packageLogUIStartedEvent = function(eventDetails) {

        Dispatcher.sendObject({hello: 'start'});
    };

    var packageLogUIStopEvent = function() {
        Dispatcher.sendObject({hello: 'stop'});
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