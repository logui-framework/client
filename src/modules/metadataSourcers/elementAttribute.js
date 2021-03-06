/*
    LogUI Client Library
    Metadata Sourcers / DOM Element Sourcer

    An IIFE function yielding a module for extracting attribute values from a given DOM element.

    @module: DOM Element Sourcer Module
    @author: David Maxwell
    @date: 2021-03-05
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
            if (element.hasAttribute(request.lookFor)) {
                return element.getAttribute(request.lookFor);
            }
        }

        return undefined;
    }

    return _sourcer;
})(window);