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
import MetadataHandler from './metadataHandler';

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

    _public.packageInteractionEvent = function(element, eventDetails, trackingConfig) {
        let packageObject = getBasicPackageObject();

        packageObject.eventType = 'interactionEvent';
        packageObject.eventDetails = eventDetails;
        packageObject.metadata = MetadataHandler.getMetadata(element, trackingConfig);

        console.log(packageObject);

        //Dispatcher.sendObject(toSend);
        // metadata sourcer has to go here.
    };

    _public.packageBrowserEvent = function(eventDetails, trackingConfig) {
        let packageObject = getBasicPackageObject();

        packageObject.eventType = 'browserEvent';
        packageObject.eventDetails = eventDetails;

        console.log(eventDetails);

        //Dispatcher.sendObject(packageObject);
    };

    _public.packageStatusEvent = function(eventDetails) {
        let packageObject = getBasicPackageObject();

        packageObject.eventType = 'statusEvent';
        packageObject.eventDetails = eventDetails;

        console.log(packageObject);

        // Dispatcher.sendObject(packageObject);
    };

    var packageLogUIStartedEvent = function() {
        let eventDetails = {
            type: 'started',
            browserAgent: 'agentString',
            resolution: '1920x1080x32',
        };

        _public.packageStatusEvent(eventDetails);
    };

    var packageLogUIStopEvent = function() {
        let eventDetails = {
            type: 'stopped',
        };

        _public.packageStatusEvent(eventDetails);
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
            applicationSpecificData: Config.applicationSpecificData.get(),
        }
    }

    return _public;
})(window);

// Next: tidy up the events to be sent to the dispatcher.
// Implement the dispatcher!