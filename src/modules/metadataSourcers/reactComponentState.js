/*
    LogUI Client Library
    Metadata Sourcers / React Component State Sourcer

    An IIFE function yielding a module for extracting state data from a React component.

    @module: React Component State Sourcer Module
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
    };

    _sourcer.getValue = function(element, request) {
        for (let key in element) {
            if (key.startsWith('__reactFiber')) {
                let stateObject = element[key]._debugOwner.stateNode.state;
                
                if (stateObject.hasOwnProperty(request.lookFor)) {
                    return stateObject[request.lookFor];
                }
            }
        }

        return undefined;
    };

    return _sourcer;
})(window);