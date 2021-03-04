/*
    LogUI Client Library
    DOM Handler Helpers Module

    IIFE function that provides helper functions for DOM traversal, manipulation, and related objects.

    @module: DOM Handler Helpers
    @author: David Maxwell
    @date: 2020-03-02
*/

import Config from '../config';
import Helpers from '../helpers';
import DOMPropertiesObject from './DOMPropertiesObject';
import EventHandlerController from '../eventHandlerController';
import { compare as specificityCompare } from 'specificity';

export default (function(root) {
    var _public = {};

    _public.generators = {
        
        trackingConfig: function*() {
            let trackingConfig = Config.elementTrackingConfig.get();

            for (let groupName in trackingConfig) {
                let groupObject = {
                    name: groupName,
                    selector: trackingConfig[groupName].selector,
                    event: trackingConfig[groupName].event,
                    selectedElements: Helpers.$$(trackingConfig[groupName].selector),
                    eventsList: getEventsList(trackingConfig[groupName].event),
                }

                if (!groupObject.eventsList) {
                    Helpers.console(`Skipping group '${groupName}'`, 'Initialisation', true);
                    continue;
                }

                yield groupObject;
            }
        },

        uniqueElements: function*() {
            let observed = new Map();

            for (let groupObject of _public.generators.trackingConfig()) {
                for (let element of groupObject.selectedElements) {
                    if (observed.has(element)) {
                        continue;
                    }

                    observed.set(element, true);
                    yield element;
                }
            }
        },

    };

    _public.processElement = function(element, groupObject) {
        if (Config.DOMProperties.has(element)) {
            let DOMProperties = Config.DOMProperties.get(element);

            for (let event of groupObject.eventsList) {
                if (DOMProperties.hasEvent(event)) {
                    let existingEventGroupName = DOMProperties.getEventGroupName(event);
                    let existingSelector = Config.elementTrackingConfig.getElementGroup(existingEventGroupName).selector;

                    // May not be necessary; good to have this sanity check in place, however.
                    if (existingEventGroupName == groupObject.name) {
                        continue;
                    }

                    let specificityComputation = (specificityCompare(existingSelector, groupObject.selector) == -1);

                    if (Config.getConfigProperty('overrideEqualSpecificity')) {
                        specificityComputation = (specificityCompare(existingSelector, groupObject.selector) <= 0);
                    }

                    if (specificityComputation) {
                        DOMProperties.deleteEventsWithGroup(existingEventGroupName);
                        DOMProperties.setEvent(event, groupObject.name);
                    }
                }
                else {
                    DOMProperties.setEvent(event, groupObject.name);
                    //Config.DOMProperties.set(DOMProperties);
                }
            }
        }
        else {
            let DOMProperties = DOMPropertiesObject(groupObject);
            Config.DOMProperties.set(element, DOMProperties);
        }
    };

    function getEventsList(event) {
        let eventsList = null;

        if (EventHandlerController.getEventHandler(event)) {
            eventsList = EventHandlerController.getEventHandlerEvents(event);

            if (!eventsList) {
                return undefined;
            }
        }
        else {
            eventsList = [event];
        }

        return eventsList;
    };

    return _public;
})(window);