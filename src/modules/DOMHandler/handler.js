/*
    LogUI Client Library
    DOM Handler Module

    An IIFE function containing key functionality for traversing the DOM, and binding event listeners to elements within the page.

    @module: DOM Handler
    @author: David Maxwell
    @date: 2020-03-02
*/

import Binder from './binder';
import DOMHandlerHelpers from './helpers';
import BrowserEventsController from './browserEventsController';
import MutationObserverController from './mutationObserverController';

export default (function(root) {
    var _public = {};

    _public.init = function() {
        runElementInitialisation();
        BrowserEventsController.init();
        Binder.init();
        MutationObserverController.init();

        return true;
    };

    _public.stop = function() {
        MutationObserverController.stop();
        BrowserEventsController.stop();
        Binder.stop();
    };

    var runElementInitialisation = function() {
        for (let groupObject of DOMHandlerHelpers.generators.trackingConfig()) {
            for (let i in Object.keys(groupObject.selectedElements)) {
                let element = groupObject.selectedElements[i];

                DOMHandlerHelpers.processElement(element, groupObject);

                // console.log(element);
                // console.log(Config.DOMProperties.get(element));
                // console.log('=====');
            }
        }
    }

    return _public;
})(window);