/*
    LogUI Client Library
    DOM Binding Module

    An IIFE function returning a binding module for LogUI.
    Provides functionality for adding event listeners to DOM elements, and a listener for DOM changes.

    @module: DOM Event Binding Functionality
    @author: David Maxwell
    @date: 2020-09-20
*/

import Config from './config';
import Helpers from './helpers';
import EventHandlers from './eventHandlers';
import { compare as specificityCompare } from 'specificity';

export default (function(root) {
    var _public = {};
    var _mutationObserver = null;

    _public.init = function() {
        _eventBindingControl.init();
        _eventBindingControl.bindListeners();
        
        _mutationObserverControl.init();


        // WHEN I COME BACK!
        // Add in functionality for document-level events (e.g. resize).
        // Then MutationObserver functionality (iterate over the config object once more)
        // Add custom log event
        

        return true;
    };

    _public.getElementLogUIProperties = function(element) {
        if (Config.domProperties.has(element)) {
            return Config.domProperties.get(element);
        }

        return undefined;
    }

    function _logUIBindTo(event) {
        console.log('some event handler!');

        if (event['type'] in EventHandlers) {
            EventHandlers[event['type']](event);
        }
        else {
            EventHandlers.unknown(event);
        }
    };

    function createElementEventsConfigObject(templateConfigObject, selector) {
        let newConfigObject = {
            events: {},
            sourceSelectors: {},
        };

        Helpers.extendObject(newConfigObject.events, templateConfigObject);

        for (let eventType in newConfigObject.events) {
            newConfigObject.sourceSelectors[eventType] = selector;
        }

        return newConfigObject;
    }

    _public.unbind = function() {
        _eventBindingControl.unbind();
        _mutationObserverControl.disconnect();
    };

    // Provide aliases for the querySelector functions.
    // $ returns a single object; $$ returns multiple!
    _public.$ = root.document.querySelector.bind(root.document);
    _public.$$ = root.document.querySelectorAll.bind(root.document);

    /*
        Yields a generator of all the elements in the DOM matching the present CSS selectors in the user's provided configuration.

        Yields a generator object which iterates over every element in the DOM that matches the given CSS selectors in the user's provided configuration..
        Note that an element may be included more than once; the same element can be picked up by more than one selector.

        @yield {object} An object consisting of: element (the Element matched), config (the configuration properties from the matched selector in the user configuration); and selector, a string representing the CSS selector that matched the element.
    */
    var elementsGenerator = function*() {
        let elementsConfig = Config.getTrackingConfig().elements;

        for (let selector in elementsConfig) {
            let selectorEventsConfig = elementsConfig[selector];
            let selectedElements = _public.$$(selector);

            for (let i in Object.keys(selectedElements)) {
                let element = selectedElements[i];

                yield({
                    element: element,
                    config: selectorEventsConfig,
                    selector: selector,
                });
            }
        }
    }

    /*
        Yields a generator of all *unique elements* in the DOM that matched against at least one of the CSS selectors in the user's provided configuration.

        @ yield {Element} An Element that is matched from one of the CSS selectors specified by the user.
    */
    var uniqueElementsGenerator = function*() {
        let uniqueElements = [];
        let selectedElements = elementsGenerator();

        for (let properties of selectedElements) {
            if (uniqueElements.indexOf(properties.element) == -1) {
                uniqueElements.push(properties.element);

                yield properties.element;
            }
        }
    }

    var _eventBindingControl = {
        init: function() {
            let selectedElements = elementsGenerator();

            for (let properties of selectedElements) {
                let element = properties.element;
                let newElementConfig = properties.config;
                let selector = properties.selector;

                if (Config.domProperties.has(element)) {
                    let currentElementEventsConfig = Config.domProperties.get(element);

                    for (let eventType in newElementConfig) {
                        if (currentElementEventsConfig.sourceSelectors.hasOwnProperty(eventType)) {
                            let existingSelector = currentElementEventsConfig.sourceSelectors[eventType];

                            if (specificityCompare(existingSelector, selector) <= 0) {
                                currentElementEventsConfig.events[eventType] = newElementConfig[eventType];
                                currentElementEventsConfig.sourceSelectors[eventType] = selector;

                                Config.domProperties.set(element, currentElementEventsConfig);
                            }
                        }
                        else {
                            currentElementEventsConfig.events[eventType] = newElementConfig;
                            currentElementEventsConfig.sourceSelectors[eventType] = selector;

                            Config.domProperties.set(element, currentElementEventsConfig);
                        }
                    }
                }
                else {
                    let currentElementEventsConfig = createElementEventsConfigObject(newElementConfig, selector);
                    Config.domProperties.set(element, currentElementEventsConfig);
                }
            }
        },

        unbind: function() {
            let selectedElements = uniqueElementsGenerator();

            for (let element of selectedElements) {
                if (element !== undefined) {
                    let elementLogUIProperties = Config.domProperties.get(element);
                    let events = elementLogUIProperties.events;

                    for (let eventType in events) {
                        _eventBindingControl.unbindListener(element, eventType);
                    }
                }
            }
        },

        bindListeners: function() {
            let uniqueElements = uniqueElementsGenerator();
            
            for (let element of uniqueElements) {
                let eventTypes = Config.domProperties.get(element).events;
    
                for (let eventType in eventTypes) {
                    _eventBindingControl.bindListener(element, eventType);
                }
            }
        },

        bindListener: function(element, eventType) {
            element.addEventListener(eventType, _logUIBindTo);
        },

        unbindListener: function(element, eventType) {
            element.removeEventListener(eventType, _logUIBindTo);
        }
        
    };


    var _mutationObserverControl = {
        init: function() {
            _mutationObserver = new MutationObserver(_mutationObserverControl.callback);
            let mutationObserverConfig = {
                attributes: false,
                childList: true,
                subtree: true,
            };
    
            _mutationObserver.observe(root.document, mutationObserverConfig);
        },

        disconnect: function() {
            _mutationObserver.disconnect();
        },

        callback: function(mutationList, observer) {
            for (let entry of mutationList) {
                for (let addedElement of entry.addedNodes) {
                    if (addedElement.nodeType == 1) {
                        console.log(addedElement);
                    }
                }

                // entry.addedNodes;
                // entry.removedNodes;
            }
        },
    };

    

    return _public;
})(window);