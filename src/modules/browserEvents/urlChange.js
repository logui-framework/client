/*
    LogUI Client Library
    Browser Events / URL Change Event

    A IIFE function yielding a module that listens for changes to the URL.

    @module: URL Change Browser Event
    @author: David Maxwell
    @date: 2021-03-02
*/

import Config from '../config';
import EventPackager from './../eventPackager';

export default (function(root) {
    var _handler = {};
    var _existingPath = root.location.href;

    _handler.init = function() {
        if (Config.browserEventsConfig.get('URLChanges', true)) {
            root.addEventListener('popstate', callback);
        }
    };

    _handler.stop = function() {
        root.removeEventListener('popstate', callback);
    };

    var callback = function(event) {
        let previousPath = _existingPath;
        let currentPath = root.location.href;
        _existingPath = currentPath;
        
        EventPackager.packageBrowserEvent({
            type: 'URLChange',
            previousURL: previousPath,
            newURL: currentPath,
        });
    };

    return _handler;
})(window);