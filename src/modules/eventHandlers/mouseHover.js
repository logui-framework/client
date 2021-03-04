/*
    LogUI Client Library
    Event Handlers / Mouse Hover Group Event

    A IIFE function yielding a mouse hover event.

    @module: Mouse Hover Event Handler
    @author: David Maxwell
    @date: 2020-10-06
*/

import RequiredFeatures from '../required';

RequiredFeatures.addFeature('IntersectionObserver');

export default (function(root) {
    var _handler = {};

    _handler.browserEvents = ['mouseover', 'mouseout'];

    _handler.init = function() {
        return;
    };

    _handler.logUIEventCallback = function(browserEvent, trackingConfig) {
        console.log('mouseHover');
        return true;
    }

    return _handler;
})(window);