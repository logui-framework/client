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
        return true;
    };

    _public.stop = function() { };

    _public.packageInteractionEvent = function(element, eventDetails, trackingConfig) {
        let packageObject = getBasicPackageObject();

        packageObject.eventType = 'interactionEvent';
        packageObject.eventDetails = eventDetails;
        packageObject.metadata = MetadataHandler.getMetadata(element, trackingConfig);

        Dispatcher.sendObject(packageObject);
    };

    _public.packageBrowserEvent = function(eventDetails, trackingConfig) {
        let packageObject = getBasicPackageObject();

        packageObject.eventType = 'browserEvent';
        packageObject.eventDetails = eventDetails;

        Dispatcher.sendObject(packageObject);
    };

    _public.packageStatusEvent = function(eventDetails) {
        let packageObject = getBasicPackageObject();

        packageObject.eventType = 'statusEvent';
        packageObject.eventDetails = eventDetails;

        Dispatcher.sendObject(packageObject);
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