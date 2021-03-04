/*
    LogUI Client Library
    Browser Events / Page Resize Event

    A IIFE function yielding a module that listens for page resize events.
    Adds some intelligent code that ensures the start and end resize events are logged -- not all of the ones in the middle.

    @module: Page Resize Event Module
    @author: David Maxwell
    @date: 2021-03-04
*/

import Config from '../config';

export default (function(root) {
    var _handler = {};
    var _timeoutID = null;

    _handler.init = function() {
        if (Config.browserEventsConfig.get('pageResize', true)) {
            root.addEventListener('resize', callback);
        }
    };

    _handler.stop = function() {
        root.removeEventListener('resize', callback);

        clearTimeout(_timeoutID);
        _timeoutID = null;
    }

    var callback = function(event) {
        clearTimeout(_timeoutID);

        _timeoutID = setTimeout(() => {
            console.log(event.target.innerWidth + "x" + event.target.innerHeight);
            EventPackager.packageBrowserEvent();
        }, 200);
    };

    return _handler;
})(window);