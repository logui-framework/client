/*
    LogUI Client Library
    Metadata Sourcers / LocalStorage Sourcer

    An IIFE function yielding a module for extracting data from localStorage.

    @module: LocalStorage Sourcer Module
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
            return localStorage.getItem(request.lookFor);
        }

        return undefined;
    }

    return _sourcer;
})(window);