/*
    LogUI Client Library
    Page-based Dispatcher

    A dispatcher object that outputs elements to a "console" element on a page.
    No network or server activity involved.

    @module: Page-based Dispatcher
    @author: David Maxwell
    @date: 2020-09-16
*/

import Defaults from '../defaults';

Defaults.dispatcher = {
    element: '#console',  // The element that the console is rendered in.
    maxDisplaySize: 100,  // The maximum number of logged events to be shown.
}

export default (function(root) {
    // Hello world
    var _public = {};
    _public.dispatcherType = 'console';

    _public.init = function() {

    };

    _public.disconnect = function() {

    };

    _public.requiredAPIs = function() {
        return [];
    }

    return _public;
})(window);