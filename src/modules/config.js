/*
    LogUI Client Library
    Configuration Module

    An IIFE function returning the configuration module for LogUI.
    Hosts configuration options and a variety of methods that are related to the configuration of the library.

    @module: Helpers
    @author: David Maxwell
    @date: 2020-10-07
*/

import Helpers from './helpers';
import ValidationSchemas from './validationSchemas';
import Defaults from './defaults';
import RequiredFeatures from './required';

const LOGUI_SESSION_ID_KEYNAME = 'logUI-sessionIDKey';

export default (function(root) {
    var _public = {};
    var _initTimestamp = null;

    var _sessionData = null;
    
    var _applicationSpecificData = {};
    var _trackingConfig = {};
    var _configProperties = null;

    var _browserEvents = {};

    var _DOMProperties = null; // Used to store properties for DOM elements on the page.

    var _styleElement = null;

    _public.init = function(suppliedConfigObject) {
        _initTimestamp = new Date();
        _configProperties = Helpers.extendObject({}, Defaults);

        let initState = (
            isSupported() &&
            validateSuppliedConfigObject(suppliedConfigObject) &&
            initConfigObjects(suppliedConfigObject)
        );

        if (!initState) {
            _initTimestamp = null;
            return initState;
        }

        _DOMProperties = new WeakMap();
        _public.CSSRules.init();
        _public.sessionData.init();
        return initState;
    };

    var initConfigObjects = function(suppliedConfigObject) {
        Helpers.extendObject(_configProperties, Defaults.dispatcher);  // Apply the defaults for the dispatcher.
        Helpers.extendObject(_configProperties, suppliedConfigObject.logUIConfiguration);  // Apply the logUIConfiguration values from the supplied config object.

        _applicationSpecificData = suppliedConfigObject.applicationSpecificData;
        _trackingConfig = suppliedConfigObject.trackingConfiguration;
        _browserEvents = suppliedConfigObject.logUIConfiguration.browserEvents;

        return true;
    };

    _public.reset = function() {
        _configProperties = null;
        _initTimestamp = null;
        _sessionData = null;

        _applicationSpecificData = {};
        _trackingConfig = {};
        _browserEvents = {};

        _public.CSSRules.reset();
    };

    _public.DOMProperties = {
        has: function(element) {
            return _DOMProperties.has(element);
        },

        set: function(element, properties) {
            _DOMProperties.set(element, properties);
        },

        get: function(element) {
            if (_DOMProperties.has(element)) {
                return _DOMProperties.get(element);
            }
            
            return undefined;
        },

        reset: function() {
            if (_public.isActive()) {
                _DOMProperties = new WeakMap();
                return true;
            }

            return false;
        }
    };

    _public.CSSRules = {
        init: function() {
            _styleElement = root.document.createElement('style');
            root.document.head.append(_styleElement);
        },

        reset: function() {
            _styleElement.remove();
            _styleElement = null;
        },

        addRule: function(selectorString, propertiesString) {
            let stylesheet = _styleElement.sheet;

            if (stylesheet) {
                stylesheet.insertRule(`${selectorString} \{ ${propertiesString} \}`);
            }
        },

        removeRule: function(selectorString, propertiesString) {
            if (_styleElement) {
                for (let i in _styleElement.sheet.cssRules) {
                    let styleElement = _styleElement.sheet.cssRules[i];
    
                    if (styleElement.cssText == `${selectorString} \{ ${propertiesString} \}`) {
                        _styleElement.sheet.removeRule(i);
                        return true;
                    }
                }
    
                return false;
            }
        },
    };

    _public.getConfigProperty = function(propertyName) {
        return _configProperties[propertyName];
    };

    // _public.getApplicationSpecificData = function() {
    //     return _applicationSpecificData;
    // };

    _public.applicationSpecificData = {
        get: function() {
            return _applicationSpecificData;
        },

        update: function(updatedObject) {
            _applicationSpecificData = Helpers.extendObject(_applicationSpecificData, updatedObject);
        },

        deleteKey: function(keyName) {
            delete _applicationSpecificData[keyName];
        },
    };

    _public.elementTrackingConfig = {
        get: function() {
            return _trackingConfig;
        },

        getElementGroup: function(groupName) {
            return _trackingConfig[groupName];
        },
    };

    _public.isActive = function() {
        return (!!_initTimestamp);
    };

    _public.getInitTimestamp = function() {
        return _initTimestamp;
    }

    _public.sessionData = {
        init: function() {
            _sessionData = {
                IDkey: null,
                sessionStartTimestamp: null,
                libraryStartTimestamp: null,
            };

            _public.sessionData.getSessionIDKey();
        },

        reset: function() {
            _public.sessionData.init();
        },

        getSessionIDKey: function() {
            return root.sessionStorage.getItem(LOGUI_SESSION_ID_KEYNAME);
        },

        clearSessionIDKey: function() {
            root.sessionStorage.removeItem(LOGUI_SESSION_ID_KEYNAME);
        },

        setID: function(newID) {
            _sessionData.IDkey = newID;
            root.sessionStorage.setItem(LOGUI_SESSION_ID_KEYNAME, newID);
        },

        setIDFromSession: function() {
            _sessionData.IDKey = root.sessionStorage.getItem(LOGUI_SESSION_ID_KEYNAME);
        },

        setTimestamps: function(sessionStartTimestamp, libraryLoadTimestamp) {
            _sessionData.sessionStartTimestamp = sessionStartTimestamp;
            _sessionData.libraryStartTimestamp = libraryLoadTimestamp;
        },

        getSessionStartTimestamp: function() {
            return _sessionData.sessionStartTimestamp;
        },

        getLibraryStartTimestamp: function() {
            return _sessionData.libraryStartTimestamp;
        },
    }

    _public.browserEventsConfig = {
        get: function(propertyName, defaultValue) {
            if (_public.browserEventsConfig.has(propertyName)) {
                return _browserEvents[propertyName];
            }

            return defaultValue;
        },

        has: function(propertyName) {
            return _browserEvents.hasOwnProperty(propertyName);
        },
    }

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

    return _public;
})(window);