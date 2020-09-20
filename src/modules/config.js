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
import ValidationSchemas from '../validationSchemas';
import Defaults from '../defaults';
import RequiredFeatures from '../required';

export default (function(root) {
    var _public = {};
    var _initTimestamp = null;
    
    var _appIdentifier = null;
    var _appSpecificData = {};
    var _trackingConfig = {};
    var _configProperties = {
        verbose: Defaults.verbose,
        sessionUUID: Defaults.sessionUUID
    };

    var isSupported = function() {
        for (const feature of RequiredFeatures.getFeatures()) {
            if (!Helpers.getElementDescendant(root, feature)) {
                Helpers.console(`The required feature '${feature}' cannot be found; LogUI cannot start!`, 'Initialisation', true);
                return false;
            }
        }

        return true;
    };

    var validateSuppliedConfigObject = function(suppliedConfigObject) {
        let validator = ValidationSchemas.validateSuppliedConfigObject(suppliedConfigObject);
        
        if (!validator.valid) {
            Helpers.console(`The configuration object passed to LogUI was not valid or complete; refer to the warning(s) below for more information.`, 'Initialisation', true);

            for (let error of validator.errors) {
                Helpers.console(`> ${error.stack}`, 'Initialisation', true);
            }

            return false;
        }

        return true;
    };

    var initConfigObjects = function(suppliedConfigObject) {
        Helpers.extendObject(_configProperties, Defaults.dispatcher);  // Apply the defaults for the dispatcher.
        Helpers.extendObject(_configProperties, suppliedConfigObject.logUIConfiguration);  // Apply the logUIConfiguration values from the supplied config object.

        _appIdentifier = suppliedConfigObject.applicationIdentifier;
        _appSpecificData = suppliedConfigObject.applicationSpecificData;
        _trackingConfig = suppliedConfigObject.trackingConfiguration;

        console.log(_appIdentifier);
        return true;
    };

    _public.getConfigProperty = function(propertyName) {
        return _configProperties[propertyName];
    };

    _public.getInitTimestamp = function() {
        return _initTimestamp;
    };

    _public.isInit = function() {
        return (!!_initTimestamp);
    };

    _public.clearSessionUUID = function() {
        console.log('clear session uuid!');
    };

    _public.init = function(suppliedConfigObject) {
        _initTimestamp = new Date();

        let initState = (
            isSupported() &&
            validateSuppliedConfigObject(suppliedConfigObject) &&
            initConfigObjects(suppliedConfigObject)
        );

        if (!initState) {
            _initTimestamp = null;
        }

        return initState;
    };

    return _public;
})(window);

// Think about tidying up the code in the rewrite to better differentiate between the config stuff
// passed through, and the parts that will be in the dispatcher!

// Rename the variables to shorten them.
// Rewrite this part. Add in an additional step to validate the input (via a schema) before setting variables.
// No need for a schema for the elements yet, we will set this up in the later stages of event binding.

// Once validation and variables have been set, I think the dispatcher can be worked on.

// Once the dispatcher has been initialised, we can work on binding the events to elements.
// Here, we need to iron out the basics of the schema for elements.
// Ensure that the binding stuff is split into functions as best as possible to ensure that we can call functions again when things change in the DOM.

// Add in the metadata stuff.