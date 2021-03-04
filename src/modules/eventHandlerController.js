/*
    LogUI Client Library
    Event Handlers Controller Module

    A IIFE function yielding the event handler controller.
    Provides access to custom event handlers and built-in basic handlers.

    @module: Event Handler Controller
    @author: David Maxwell
    @date: 2020-09-21
*/

import Helpers from './helpers';
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

    _public.getEventHandler = function(eventName) {
        if (ImportedEventHandlers.hasOwnProperty(eventName)) {
            return ImportedEventHandlers[eventName];
        }

        return false;
    };

    _public.getEventHandlerEvents = function(eventName) {
        if (ImportedEventHandlers.hasOwnProperty(eventName)) {
            if (ImportedEventHandlers[eventName].hasOwnProperty('browserEvents')) {
                return ImportedEventHandlers[eventName]['browserEvents'];
            }
            else {
                Helpers.console(`The event handler '${eventName}' does not have the required property 'browserEvents'.`, 'Initialisation', true);
                return false;
            }
        }
        
        return undefined;
    };

    return _public;
})(window);