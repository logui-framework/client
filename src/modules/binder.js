/*
    LogUI Client Library
    DOM Binding Module

    An IIFE function returning a binding module for LogUI.
    Provides functionality for adding event listeners to DOM elements, and a listener for DOM changes.

    @module: DOM Event Binding Functionality
    @author: David Maxwell
    @date: 2020-10-06
*/

import Config from './config';
import Helpers from './helpers';
import EventController from './eventController';
import { compare as specificityCompare } from 'specificity';

export default (function(root) {
    var _public = {};
    var _mutationObserver = null;

    _public.init = function() {
        console.log('init');


        return true;
    };

    _public.unbind = function() {
        console.log('unbind');
    };

    // Provide aliases for the querySelector functions.
    // $ returns a single object; $$ returns multiple!
    _public.$ = root.document.querySelector.bind(root.document);
    _public.$$ = root.document.querySelectorAll.bind(root.document);

    var _logUIBindTo = function(event) {
        console.log('LOGUI Function Bind');
    };

    var _elementEventBindingControl = {
        init: function() {

        },

        unbind: function() {

        },
    };

    var _documentEventBindingControl = {

    };

    var _mutationObserverControl = {

    };

    return _public;
})(window);