/*
    LogUI Client Library
    Event Handlers / Sample Event Handler

    A IIFE function returning a sample event handler.
    Copy and paste this module to create your own handler.

    @module: Sample Event Handlers
    @author: David Maxwell
    @date: 2020-10-06
*/

import RequiredFeatures from '../required';

RequiredFeatures.addFeature('IntersectionObserver');

export default (function(root) {
    var _handler = {};

    _handler.init = function() {
        return;
    };

    _handler.callback = function(browserEvent, trackingConfig) {
        return true;
    }

    return _handler;
})(window);