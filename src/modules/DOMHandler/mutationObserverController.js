/*
    LogUI Client Library
    DOM Handler Helpers Module

    IIFE function that provides a controller for a global MutationObserver (checking for DOM changes).
    Calls the necessary events to bind event listeners to new elements (if they match a rule).

    @module: Mutation Observer Controller Handler
    @author: David Maxwell
    @date: 2020-03-02
*/

import Binder from './binder';
import DOMHandlerHelpers from './helpers';

export default (function(root) {
    var _public = {};
    var _mutationObserver = null;

    _public.init = function() {
        _mutationObserver = new MutationObserver(observerCallback);

        let options = {
            childList: true,
            attributes: false,
            characterData: false,
            subtree: true,
        };

        _mutationObserver.observe(root.document, options);
    };

    _public.stop = function() {
        _mutationObserver.disconnect();
        _mutationObserver = null;
    };

    var observerCallback = function(mutationsList) {
        for (let record of mutationsList) {
            if (record.type == 'childList') {
                for (let element of record.addedNodes) {
                    if (element.nodeType == 1) {
                        processAddedElement(element);

                        // There may be child elements that need to be processed, too.
                        // The recurive function processDescendants handles this.
                        processDescendants(element);
                    }
                }
            }
        }
    };

    var processDescendants = function(element) {
        let childArray = Array.from(element.children);

        childArray.forEach((childElement) => {
            processAddedElement(childElement);
            processDescendants(childElement);
        });
    };

    var processAddedElement = function(element) {
        let shallBind = false;

        for (let groupObject of DOMHandlerHelpers.generators.trackingConfig()) {
            if (element.matches(groupObject.selector)) {
                shallBind = true;
                DOMHandlerHelpers.processElement(element, groupObject);
            }
        }

        if (shallBind) {
            Binder.bind(element);
        }
    };

    return _public;
})(window);