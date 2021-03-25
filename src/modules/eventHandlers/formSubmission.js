/*
    LogUI Client Library
    Event Handlers / Form Submission Group Event

    A IIFE function yielding a form submission event.

    @module: Form Submission Event Handler
    @author: David Maxwell
    @date: 2021-03-25
*/

import Config from '../config';
import Helpers from '../helpers';
import MetadataHandler from '../metadataHandler';

export default (function(root) {
    var _handler = {};

    _handler.browserEvents = ['submit'];

    _handler.init = function() {
        return;
    };

    _handler.logUIEventCallback = function(eventContext, browserEvent, trackingConfig) {
        let customName = trackingConfig.name;
        let formElementValues = getFormElementValue(trackingConfig);
        let returnObject = {
            type: browserEvent.type,
        };

        console.log(customName);

        if (customName) {
            returnObject.name = customName;
        }

        if (formElementValues.length > 0) {
            returnObject.submissionValues = formElementValues;
        }
        
        return returnObject;
    };

    var getFormElementValue = function(trackingConfig) {
        let trackingConfigProperties = trackingConfig.properties;
        let returnArray = [];
        let observedNames = [];

        if (trackingConfigProperties &&
            trackingConfigProperties.hasOwnProperty('includeValues')) {
                for (let entry of trackingConfigProperties.includeValues) {
                    let element = Helpers.$(entry.selector);

                    if (!element) {
                        continue;
                    }
                    
                    let returnedObject = MetadataHandler.getMetadataValue(element, entry);
                    
                    if (!returnedObject) {
                        continue;
                    }

                    if (observedNames.includes(entry.nameForLog)) {
                        continue;
                    }

                    observedNames.push(entry.nameForLog);
                    returnArray.push(returnedObject);
                }
        }
        
        return returnArray;
    }

    return _handler;
})(window);