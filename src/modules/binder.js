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
        
        let uniqueElements = initDOMReferences(trackingConfig.elements);
        initBindListeners(uniqueElements);

        
        
        // Use a WeakMap to store references to the DOM.
        // Iterate over each selector from the config, and extract each element from the NodeList.
        // For another selector, an element that already has been added may be present!
        //   In that case, add new events that we haven't tracked.
        //   For events that already have entries, we need to work out what one to use.
        //   This is where CSS specificifty comes in.
        // When a DOM element is deleted, the event listener is apparently removed, too.

        // When an element is clicked, we can check the DS to see what the properties are!
        // When an element is removed (mutationobs), we shouldn't need to do anything.
        // When adding an element (mutationobs), does it exist in the DS AND the config (i.e. selector)?
        // Remember, we could already have an event present for an element.
        //  If no, then add it.
        //  If yes, then check the listeners already present.
        //      If the listener exists already, we need to use CSS specificify to work out what to use.
        //      If we need a new listener, we simply re-apply as only one listener can be bound for the same event type.

        // But when LogUI is stopped, we need to iterate over the config again.
        // Find all of the elements, and remove listeners from them.
        // Simple set of loops.

        // WHENEVER
        // There is a circular dependency between the Binder and EventHandlers objects.
        // This is caused when we attempt to bind events. This needs to be eliminated.
        // - Add in binding functionality.
        // - Add in stop functionality
        // - Add in mutationobserver functionality (probably using .matches())
        
        
        
        //initMutationObserver();

        return true;
    };

    function initBindListeners(uniqueElements) {
        for (let element of uniqueElements) {
            let eventTypes = Config.domProperties.get(element).properties;

            for (let eventType in eventTypes) {
                bindListener(element, eventType)
            }
        }
    }

    _public.getElementLogUIProperties = function(element) {
        if (Config.domProperties.has(element)) {
            return Config.domProperties.get(element);
        }

        return undefined;
    }

    function logUIEventBinder(event) {
        console.log('some event handler!');
        //console.log(event['type']);
    
        if (event['type'] in EventHandlers) {
            EventHandlers[event['type']](event);
        }
        else {
            EventHandlers.unknown(event);
        }
    };

    function bindListener(node, eventType) {
        node.addEventListener(eventType, logUIEventBinder);
    }

    function createNodeEventsConfigObject(templateConfigObject, selector) {
        let newConfigObject = {
            properties: {},
            sourceSelectors: {},
        };

        Helpers.extendObject(newConfigObject.properties, templateConfigObject);
        // MAYBE THIS IS THE PROBLEM?

        for (let eventType in newConfigObject.properties) {
            newConfigObject.sourceSelectors[eventType] = selector;
        }

        return newConfigObject;
    }

    function initDOMReferences(elementsConfig) {
        let uniqueElements = [];

        for (let selector in elementsConfig) {
            let selectorEventsConfig = elementsConfig[selector];
            let selectorNodes = _public.$$(selector);

            //console.log('');
            //console.log('======== ' + selector);

            for (let i in Object.keys(selectorNodes)) {
                let node = selectorNodes[i];

                if (uniqueElements.indexOf(node) == -1) {
                    uniqueElements.push(node);
                }

                //console.log(node);
                //console.log('~~~');

                if (Config.domProperties.has(node)) {
                    //console.log('it exists already!');
                    let nodeEventsConfig = Config.domProperties.get(node);

                    for (let eventType in selectorEventsConfig) {
                        if (nodeEventsConfig['sourceSelectors'].hasOwnProperty(eventType)) {
                            let existingSelector = nodeEventsConfig['sourceSelectors'][eventType];

                            //console.log(eventType + ' already exists; we need to do checks.');

                            //console.log('The existing selector was ' + existingSelector);
                            //console.log('The selector for the proposed replacement is ' + selector);

                            if (specificityCompare(existingSelector, selector) <= 0) {
                                //console.log('We should replace the exising event for ' + eventType);

                                nodeEventsConfig['properties'][eventType] = selectorEventsConfig[eventType];
                                nodeEventsConfig['sourceSelectors'][eventType] = selector;

                                Config.domProperties.set(node, nodeEventsConfig);
                                //console.log(nodeEventsConfig);
                            }
                            else {
                                //console.log('Specificity is not in agreement; ignore change');
                            }
                        }
                        else {
                            //console.log('eventType ' + eventType + ' does not exist yet, so we can just add it.');

                            nodeEventsConfig['properties'][eventType] = selectorEventsConfig[eventType];
                            nodeEventsConfig['sourceSelectors'][eventType] = selector;

                            Config.domProperties.set(node, nodeEventsConfig);
                        }
                    }
                }
                else {
                    //console.log('it does not exist; create it!');
                    let nodeEventsConfig = createNodeEventsConfigObject(selectorEventsConfig, selector);
                    
                    Config.domProperties.set(node, nodeEventsConfig);
                    //console.log(nodeEventsConfig);
                }
            }
        }

        return uniqueElements;
    };

    _public.unbind = function() {
        //_mutationObserver.disconnect();
    };

    // Provide aliases for the querySelector functions.
    // $ returns a single object; $$ returns multiple!
    _public.$ = root.document.querySelector.bind(root.document);
    _public.$$ = root.document.querySelectorAll.bind(root.document);

    function initMutationObserver() {
        _mutationObserver = new MutationObserver(mutationObserverCallback);
        let mutationObserverConfig = {
            attributes: false,
            childList: true,
            subtree: true,
        };

        _mutationObserver.observe(root.document, mutationObserverConfig);
    };

    function mutationObserverCallback(mutationList, observer) {
        let addedNodes = [];
        let removedNodes = [];
        
        for (let entry in mutationList) {
            entry = mutationList[entry];

            // entry.addedNodes;
            // entry.removedNodes;
        }
    };

    function bindElementListeners(elementConfig) {

    };

    

    return _public;
})(window);