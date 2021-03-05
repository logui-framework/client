/*
    LogUI Client Library
    Required Functionality Module

    An IIFE function providing a list of required functionality.
    Supports the addition of additional functionality for extensions.

    @module: Required Functionality Module
    @author: David Maxwell
    @date: 2020-10-06
*/

export default (function() {
    var _public = {};
    var requiredFeatures = [
        'console',
        'document',
        'document.documentElement',
        'document.querySelector',
        'document.querySelectorAll',
        'navigator',
        'addEventListener',
        'sessionStorage',
        'MutationObserver',
        'Number',
        'WeakMap',
        'Map',
        'Date',
        'Object',
    ];

    _public.getFeatures = function() {
        return requiredFeatures;
    }

    _public.addFeature = function(feature) {
        requiredFeatures.push(feature);
    }

    return _public;
})();