/*
    LogUI Client Library
    Event Handlers Controller Module

    A IIFE function yielding the event handler controller.
    Provides access to custom event handlers and built-in basic handlers.

    @module: Event Handler Controller
    @author: David Maxwell
    @date: 2020-09-21
*/

import ImportedEventHandlers from './eventHandlers/*';

export default (function(root) {
    var _public = {};

    _public.init = function() {
        for (let eventHandler in ImportedEventHandlers) {
            if (ImportedEventHandlers[eventHandler].hasOwnProperty('init')) {
                ImportedEventHandlers[eventHandler].init();
            }
        }

        return true;
    };

    _public.stop = function() {
        for (let eventHandler in ImportedEventHandlers) {
            if (ImportedEventHandlers[eventHandler].hasOwnProperty('stop')) {
                ImportedEventHandlers[eventHandler].stop();
            }
        }
    }

    _public.eventHandlers = ImportedEventHandlers;

    return _public;
})(window);



// export default (function(root) {
//     var _events = {};

//     function getLogUIElementProperties(event) {
//         console.log(event);
    
//         let element = event.target;
//         let properties = Config.domProperties.get(element);
    
//         console.log(element);
//         console.log(properties);
//     };

//     _events.unknown = function(event) {
//         console.log('unknown fn handler');
//     };

//     _events.click = function(event) {
//         console.log('special click fn');
//         console.log(getLogUIElementProperties(event));
//     };

//     _events.mouseover = function(event) {
//         console.log('hover in fn');
//     };

//     _events.mouseout = function(event) {
//         console.log('hover out');
//     };

//     return _events;
// })(window);