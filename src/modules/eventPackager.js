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
    };

    _public.packageInteractionEvent = function() {
        Dispatcher.sendObject({hello: 'world'});
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

    var getBasicPackageObject = function() {
        return {
            eventType: null,
            eventDetails: {},
            clientTimestamps: {
                fromPageLoad: 0,
                absolute: 0,
            },
            applicationSpecificData: Config.getApplicationSpecificData(),
        }
    }

    return _public;
})(window);