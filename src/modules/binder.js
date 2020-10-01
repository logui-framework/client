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
        let trackingConfig = Config.getTrackingConfig();
        let uniqueElements = _eventBindingControl.init(trackingConfig.elements);
        
        _eventBindingControl.bindListeners(uniqueElements);
        //initMutationObserver();


        // WHEN I COME BACK SATURDAY EVENING
        // Then focus on stop functionality.
        // Add in functionality for document-level events (e.g. resize).
        // Then MutationObserver functionality (iterate over the config object once more)
        

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

    function createNodeEventsConfigObject(templateConfigObject, selector) {
        let newConfigObject = {
            properties: {},
            sourceSelectors: {},
        };

        Helpers.extendObject(newConfigObject.properties, templateConfigObject);

        for (let eventType in newConfigObject.properties) {
            newConfigObject.sourceSelectors[eventType] = selector;
        }

        return newConfigObject;
    }

    _public.unbind = function() {
        _eventBindingControl.unbind();
        //_mutationObserver.disconnect();
    };

    // Provide aliases for the querySelector functions.
    // $ returns a single object; $$ returns multiple!
    _public.$ = root.document.querySelector.bind(root.document);
    _public.$$ = root.document.querySelectorAll.bind(root.document);

    var _eventBindingControl = {
        init: function(elementsConfig) {
            let uniqueElements = [];

            for (let selector in elementsConfig) {
                let selectorEventsConfig = elementsConfig[selector];
                let selectorNodes = _public.$$(selector);
    
                for (let i in Object.keys(selectorNodes)) {
                    let node = selectorNodes[i];
    
                    if (uniqueElements.indexOf(node) == -1) {
                        uniqueElements.push(node);
                    }
    
                    if (Config.domProperties.has(node)) {
                        let nodeEventsConfig = Config.domProperties.get(node);
    
                        for (let eventType in selectorEventsConfig) {
                            if (nodeEventsConfig['sourceSelectors'].hasOwnProperty(eventType)) {
                                let existingSelector = nodeEventsConfig['sourceSelectors'][eventType];
    
                                if (specificityCompare(existingSelector, selector) <= 0) {
                                    nodeEventsConfig['properties'][eventType] = selectorEventsConfig[eventType];
                                    nodeEventsConfig['sourceSelectors'][eventType] = selector;
    
                                    Config.domProperties.set(node, nodeEventsConfig);
                                }
                            }
                            else {
                                nodeEventsConfig['properties'][eventType] = selectorEventsConfig[eventType];
                                nodeEventsConfig['sourceSelectors'][eventType] = selector;
    
                                Config.domProperties.set(node, nodeEventsConfig);
                            }
                        }
                    }
                    else {
                        let nodeEventsConfig = createNodeEventsConfigObject(selectorEventsConfig, selector);
                        Config.domProperties.set(node, nodeEventsConfig);
                    }
                }
            }
    
            return uniqueElements;
        },

        unbind: function() {
            // The logic to get elements and config events can probably be wrapped in a generator and re-used?
            let uniqueElements = [];
            let configElements = Config.getTrackingConfig().elements;

            for (let selector in configElements) {
                let selectorNodes = _public.$$(selector);
                let events = configElements[selector];

                for (let i in Object.keys(selectorNodes)) {
                    let node = selectorNodes[i];

                    for (let event in events) {
                        _eventBindingControl.unbindListener(node, event);
                    }
                }
            }
        },

        bindListeners: function(uniqueElements) {
            for (let element of uniqueElements) {
                let eventTypes = Config.domProperties.get(element).properties;
    
                for (let eventType in eventTypes) {
                    _eventBindingControl.bindListener(element, eventType);
                }
            }
        },

        bindListener: function(node, eventType) {
            node.addEventListener(eventType, _logUIBindTo);
        },

        unbindListener: function(node, eventType) {
            node.removeEventListener(eventType, _logUIBindTo);
        }
        
    };


    var _mutationObserverControl = {
        init: function() {
            _mutationObserver = new MutationObserver(mutationObserverCallback);
            let mutationObserverConfig = {
                attributes: false,
                childList: true,
                subtree: true,
            };
    
            _mutationObserver.observe(root.document, mutationObserverConfig);
        },

        callback: function(mutationList, observer) {
            let addedNodes = [];
            let removedNodes = [];
            
            for (let entry in mutationList) {
                entry = mutationList[entry];
    
                // entry.addedNodes;
                // entry.removedNodes;
            }
        },
    };

    

    return _public;
})(window);