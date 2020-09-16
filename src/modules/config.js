/*
    LogUI Client Library
    Configuration Module

    An IIFE function returning the configuration module for LogUI.
    Hosts configuration options and a variety of methods that are related to the configuraiton of the library.

    @module: Helpers
    @author: David Maxwell
    @date: 2020-09-16
*/

import Helpers from './helpers';
import Defaults from '../defaults';
import RequiredFeatures from '../required';

export default (function(root) {
    var _public = {};
    var _initTimestamp = null;
    var _properties = {
        verbose: Defaults.verbose,
        dispatcher: {},
    };

    var isSupported = function() {
        for (const feature of RequiredFeatures.getFeatures()) {
            if (!Helpers.getElementDescendant(root, feature)) {
                Helpers.console(`The required feature '${feature}' cannot be found; LogUI cannot start!`, 'Initialisation');
                return false;
            }
        }

        return true;
    }

    _public.getProperty = function(propertyName) {
        return _properties[propertyName];
    };

    _public.getInitTimestamp = function() {
        return _initTimestamp;
    };

    _public.isInitialised = function() {
        return (!!_initTimestamp);
    };

    _public.init = function() {
        _initTimestamp = new Date();

        return (
            isSupported() &&
            true
        );
    };

    

    return _public;
})(window);