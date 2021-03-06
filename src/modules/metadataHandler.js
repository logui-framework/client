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

    _public.getMetadata = function(element, trackingConfig) {
        let returnArray = [];
        let observedNames = [];

        if (trackingConfig.hasOwnProperty('metadata')) {
            for (let entry of trackingConfig.metadata) {
                let selectedSourcer = getSourcer(entry.sourcer);

                if (!selectedSourcer) {
                    continue;
                }

                if (!entry.hasOwnProperty('nameForLog') || !entry.hasOwnProperty('lookFor')) {
                    continue;
                }

                if (observedNames.includes(entry.nameForLog)) {
                    continue;
                }

                let objectToPush = selectedSourcer.getObject(element, entry);

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

// Build a very simple react app (clock or something with a button)