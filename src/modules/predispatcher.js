/*
    LogUI Client Library
    Predispatcher Module

    An IIFE function returning the predispatching phase of LogUI.
    Handles the gathering of key metadata before sending the completed object to the dispatcher.

    @module: Predispatcher
    @author: David Maxwell
    @date: 2020-10-05
*/

import Dispatcher from '__dispatcherImport__';

export default (function(root) {
    var _public = {};

    _public.predispatchElement = function(element, event) {
        // Preprocess here.
        Dispatcher.sendObject(event);
    };

    return _public;
})(window);