/*
    LogUI Client Library
    Browser Events / Page Focus Event

    A IIFE function yielding a module that listens for when the page focus is lost or gained.

    @module: URL Change Browser Event
    @author: David Maxwell
    @date: 2021-03-02
*/

import Config from '../config';
import EventPackager from './../eventPackager';

export default (function(root) {
    var _handler = {};

    _handler.init = function() {
        if (Config.browserEventsConfig.get('pageFocus', true)) {
            root.addEventListener('blur', callback);
            root.addEventListener('focus', callback);
        }
    };

    _handler.stop = function() {
        root.removeEventListener('blur', callback);
        root.removeEventListener('focus', callback);
    };

    var callback = function(event) {
        let pageHasFocus = (event.type === 'focus');
        
        // pageHasFocus is true if the user enters the page.

        console.log(pageHasFocus);

        EventPackager.packageBrowserEvent();
    };

    return _handler;
})(window);