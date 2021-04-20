/*
    LogUI Client Library
    Event Handlers / Scrolling Event

    A IIFE function yielding a scrolling event handler.

    @module: Scrolling Event Handler
    @author: David Maxwell
    @date: 2021-04-20
*/

import EventPackager from '../eventPackager';
import RequiredFeatures from '../required';

RequiredFeatures.addFeature('WeakMap');

const DELAY_TIME = 50;

export default (function(root) {
    var _handler = {};
    var tracking = null;
    var globalHandles = null;

    _handler.browserEvents = ['scroll'];
    
    _handler.init = function() {
        tracking = new WeakMap();
        globalHandles = []; // Keep track of all handles for when this event handler is stopped.

        return;
    };

    _handler.stop = function() {
        for (let handleID of globalHandles) {
            clearTimeout(handleID);
        }

        tracking = null;
        globalHandles = null;
    }

    _handler.logUIEventCallback = function(eventContext, browserEvent, trackingConfig) {
        let element = eventContext;

        // If tracking has the element in question, we know there's already a queue. So we should add to it.
        // We shouldn't log here, as the queue is non-zero. So we add to it, and simply return.
        if (tracking.has(element)) {
            let existing = tracking.get(element);
            
            let handle = (setTimeout(() => {
                endScrollEvent(element, handle);
            }, DELAY_TIME));

            globalHandles.push(handle);

            existing['handles'].push(handle);
            tracking.set(element, existing);
            return;
        }

        // If we get here, we know that the element has not yet been tracked.
        // We can create the necessary data structure to track its scrolling interactions, and fire off an event for the start of scrolling.
        let handle = (setTimeout(() => {
            endScrollEvent(element, handle);
        }, DELAY_TIME));

        globalHandles.push(handle);

        let mappedObject = {
            handles: [handle],
            eventContext: eventContext,
            trackingConfig: trackingConfig,
        };

        tracking.set(element, mappedObject);

        let returnObject = {
            type: 'scrollStart',
        }

        let eventName = getEventName(trackingConfig, 'scrollStart')

        if (eventName) {
            returnObject['name'] = eventName;
        }

        return returnObject;
    }

    var endScrollEvent = function(element, handle) {
        if (tracking.has(element)) {
            let trackedElementDetails = tracking.get(element);
            let i = trackedElementDetails['handles'].indexOf(handle);

            // The timeout for the given handle has been met; remove it from the array of current timeout handles on this element.
            trackedElementDetails['handles'].splice(i, 1);

            // Make sure we remove the entry from globalHandles, too!
            // Re-use i here. We don't need it.
            i = globalHandles.indexOf(handle);
            globalHandles.splice(i, 1);

            // If the array has reached a length of zero, there are no more pending timeouts to remove.
            // In this instance, the scroll event has been completed; remove from the tracking WeakMap and tell the Event Packager to package up a scroll complete.
            // Using EventPackager here is J-A-N-K-Y -- in a future revision, it would be good to send it back to the EventCallbackHandler and tell that to package up.
            // This feels like I'm cheating a little bit :-( Future self: we need EventCallbackHandler to handle asynchronous events being fired in.
            if (trackedElementDetails['handles'].length == 0) {
                tracking.delete(element);

                let returnObject = {
                    type: 'scrollEnd',
                }
        
                let eventName = getEventName(trackedElementDetails['trackingConfig'], 'scrollEnd')
        
                if (eventName) {
                    returnObject['name'] = eventName;
                }

                // This is hacky. This should not be called here. This should be like an async callback to the EventCallbackHandler.
                EventPackager.packageInteractionEvent(element, returnObject, trackedElementDetails['trackingConfig']);
            }
        }

        return;
    }

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