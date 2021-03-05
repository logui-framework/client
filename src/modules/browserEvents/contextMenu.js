/*
    LogUI Client Library
    Browser Events / Context Menu Module

    A IIFE function yielding a module that provides functionality for tracking the appearance of the context menu.

    @module: Context Menu Tracking Module
    @author: David Maxwell
    @date: 2021-03-04
*/

import Config from '../config';
import EventPackager from './../eventPackager';

export default (function(root) {
    var _handler = {};

    _handler.init = function() {
        if (Config.browserEventsConfig.get('contextMenu', true)) {
            root.document.addEventListener('contextmenu', callback);
        }
    };

    _handler.stop = function() {
        root.document.removeEventListener('contextmenu', callback);
    };

    var callback = function(event) {
        EventPackager.packageBrowserEvent({
            type: 'contextMenuFired',
        });
    };

    return _handler;
})(window);