/*
    LogUI Client Library
    Metadata Sourcers / React Component Prop Sourcer

    An IIFE function yielding a module for extracting prop data from a React component.

    @module: React Component Prop Sourcer Module
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
                let propsObject = element[key]._debugOwner.stateNode.props;
                
                if (propsObject.hasOwnProperty(request.lookFor)) {
                    return propsObject[request.lookFor];
                }
            }
        }

        return undefined;
    };

    return _sourcer;
})(window);