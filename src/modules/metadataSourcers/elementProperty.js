/*
    LogUI Client Library
    Metadata Sourcers / DOM Element Property Sourcer

    An IIFE function yielding a module for extracting property values from a given DOM element.

    @module: DOM Element Property Sourcer Module
    @author: David Maxwell
    @date: 2021-03-25
*/

export default (function(root) {
    var _sourcer = {};

    _sourcer.init = function() {
    };

    _sourcer.stop = function() {
        
    };

    _sourcer.getObject = function(element, request) {
        let value = _sourcer.getValue(element, request);

        if (value) {
            return {
                name: request.nameForLog,
                value: value,
            };
        }

        return undefined;
    }

    _sourcer.getValue = function(element, request) {
        if (request.hasOwnProperty('lookFor')) {
            if (element[request.lookFor]) {
                return element[request.lookFor];
            }
        }

        return undefined;
    }

    return _sourcer;
})(window);