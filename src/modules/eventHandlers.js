/*
    LogUI Client Library
    Event Handlers Module

    A IIFE function yielding helper functions that act as event handlers.
    When an event is fired by the browser, one of these bound events will be called.

    @module: Helpers
    @author: David Maxwell
    @date: 2020-09-21
*/

import Config from './config';

export default (function(root) {
    var _events = {};

    function getLogUIElementProperties(event) {
        console.log(event);
    
        let element = event.target;
        let properties = Config.domProperties.get(element);
    
        console.log(element);
        console.log(properties);
    };

    _events.unknown = function(event) {
        console.log('unknown fn handler');
    };

    _events.click = function(event) {
        console.log('special click fn');
        console.log(getLogUIElementProperties(event));
    };

    _events.mouseover = function(event) {
        console.log('hover in fn');
    };

    _events.mouseout = function(event) {
        console.log('hover out');
    };

    return _events;
})(window);