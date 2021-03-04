/*
    LogUI Client Library
    Browser Events Controller Module

    IIFE function that provides a controller for maintaining browser events (i.e., not pertaining to a specific page element, rather document or window).
    Provides functionality to spin up and stop event listeners.

    @module: Browser Events Controller Module
    @author: David Maxwell
    @date: 2020-03-02
*/

import Config from '../config';
import Helpers from './../helpers';
import BrowserEvents from './../browserEvents/*';

export default (function(root) {
    var _public = {};
    
    _public.init = function() {
        for (let browserEventName in BrowserEvents) {
            BrowserEvents[browserEventName].init();
        }
    }

    _public.stop = function() {
        for (let browserEventName in BrowserEvents) {
            let browserEvent = BrowserEvents[browserEventName];

            if (browserEvent.hasOwnProperty('stop')) {
                browserEvent.stop();
            }
        }
    }

    return _public;
})(window);