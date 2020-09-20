/*
    LogUI Client Library
    DOM Binding Module

    An IIFE function returning a binding module for LogUI.
    Provides functionality for adding event listeners to DOM elements, and a listener for DOM changes.

    @module: DOM Binder
    @author: David Maxwell
    @date: 2020-09-20
*/

export default (function(root) {
    var _public = {};

    _public.init = function() {
        //console.log(_public.$('#console'));
    };

    // Provide aliases for the querySelector functions.
    // $ returns a single object; $$ returns multiple!
    _public.$ = root.document.querySelector.bind(root.document);
    _public.$$ = root.document.querySelectorAll.bind(root.document);

    return _public;
})(window);