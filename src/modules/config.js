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

    var _applicationIdentifierString = null;
    var _applicationSpecificData = {};
    var _trackingConfiguration = {};
    var _logUIConfigurationProperties = {
        verbose: Defaults.verbose,
        sessionUUID: Defaults.sessionUUID,
    };

    var isSupported = function() {
        for (const feature of RequiredFeatures.getFeatures()) {
            if (!Helpers.getElementDescendant(root, feature)) {
                Helpers.console(`The required feature '${feature}' cannot be found; LogUI cannot start!`, 'Initialisation');
                return false;
            }
        }

        return true;
    };

    var initialiseConfigurationObjects = function(configurationObject) {
        Helpers.extendObject(_logUIConfigurationProperties, Defaults.dispatcher);
        Helpers.extendObject(_logUIConfigurationProperties, configurationObject.logUIConfiguration);

        _trackingConfiguration = configurationObject.trackingConfiguration;
        _applicationSpecificData = configurationObject._applicationSpecificData;
        _applicationIdentifierString = configurationObject._applicationIdentifier;

        return true;
    };

    _public.getLogUIConfigurationProperty = function(propertyName) {
        return _logUIConfigurationProperties[propertyName];
    };

    _public.getInitTimestamp = function() {
        return _initTimestamp;
    };

    _public.isInitialised = function() {
        return (!!_initTimestamp);
    };

    _public.clearSessionUUID = function() {
        console.log('clear session uuid!');
    };

    _public.init = function(configurationObject) {
        _initTimestamp = new Date();

        let initialisationState = (
            isSupported() &&
            initialiseConfigurationObjects(configurationObject)
        );

        if (!initialisationState) {
            _initTimestamp = null;
        }

        return initialisationState;
    };

    return _public;
})(window);