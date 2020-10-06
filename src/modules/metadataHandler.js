/*
    LogUI Client Library
    Metadata Handler Module

    An IIFE function returning the handler for metadata for LogUI.
    Gathers data from various sources in preparation for sending to the dispatcher.

    @module: MetadataHandler
    @author: David Maxwell
    @date: 2020-10-05
*/


export default (function(root) {
    var _public = {};

    _public.get = function(property) {
        // property should contain an object -- source and name, along with other data.
        // map source to a private function in this module.

        // _mapRequestToSource(property)

        return true;
    };

    var _mapRequestToSource = function(property) {
        return true;
    };

    var _elementAttribute = {
        get = function(element, name) {
            return true;
            // get the attribute value and return it.
        }
    };

    var _nodeJSState = {

    };

    var _sessionStorage = {

    };

    var _localStorage = {

    };

    return _public;
})(window);