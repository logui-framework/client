/*
    LogUI Client Library
    Metadata Handler Module

    An IIFE function returning the handler for metadata for LogUI.
    Gathers data from various sources in preparation for sending to the dispatcher.

    @module: Metadata Handler Module
    @author: David Maxwell
    @date: 2021-03-05
*/

import Sourcers from './metadataSourcers/*';

export default (function(root) {
    var _public = {};

    _public.init = function() {
        for (let sourcer in Sourcers) {
            Sourcers[sourcer].init();
        }

        return true;
    };

    _public.stop = function() {
        for (let sourcerName in Sourcers) {
            let sourcer = Sourcers[sourcerName];

            if (sourcer.hasOwnProperty('stop')) {
                sourcer.stop();
            }
        }
    };

    _public.getMetadataValue = function(element, entryConfig) {
        let selectedSourcer = getSourcer(entryConfig.sourcer);

        if (!selectedSourcer) {
            return;
        }

        if (!entryConfig.hasOwnProperty('nameForLog') || !entryConfig.hasOwnProperty('lookFor')) {
            return;
        }

        return selectedSourcer.getObject(element, entryConfig);
    };

    _public.getMetadata = function(element, trackingConfig) {
        let returnArray = [];
        let observedNames = [];

        if (trackingConfig.hasOwnProperty('metadata')) {
            for (let entry of trackingConfig.metadata) {
                let objectToPush = _public.getMetadataValue(element, entry);

                if (observedNames.includes(entry.nameForLog)) {
                    continue;
                }

                if (objectToPush) {
                    returnArray.push(objectToPush);
                    observedNames.push(entry.nameForLog);
                }
            }
        }

        return returnArray;
    };

    var getSourcer = function(requestedSourcerName) {
        for (let sourcerName in Sourcers) {
            if (sourcerName == requestedSourcerName) {
                return Sourcers[sourcerName];
            }
        }

        return undefined;
    };

    return _public;
})(window);