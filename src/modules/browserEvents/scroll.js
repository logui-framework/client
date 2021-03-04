/*
    LogUI Client Library
    Browser Events / Scroll Event

    A IIFE function yielding a module that listens for page scrolls.
    Also provides functionality to pause listeners when scrolling is taking place.

    @module: Scroll Browser Event
    @author: David Maxwell
    @date: 2021-03-02
*/

// import RequiredFeatures from '../required';

// RequiredFeatures.addFeature('IntersectionObserver');

import Config from '../config';

export default (function(root) {
    var _handler = {};
    var _isScrolling = false;

    _handler.init = function() {
        if (Config.browserEventsConfig.get('eventsWhileScrolling', true)) {
            Config.CSSRules.addRule('.disable-hover, disable-hover *', 'pointer-events: none !important;');
            root.addEventListener('scroll', callback);
        }
    };

    _handler.stop = function() {
        root.removeEventListener('scroll', callback);
    }

    var callback = function(event) {
        // Setting the timeout to zero should mean the timeout fires when the callback has completed.
        // See https://stackoverflow.com/a/25614886
        _isScrolling = setTimeout(() => {
            root.document.body.classList.remove('disable-hover');
        }, 0);

        if (!root.document.body.classList.contains('disable-hover')) {
            root.document.body.classList.add('disable-hover');
        }
    };

    return _handler;
})(window);