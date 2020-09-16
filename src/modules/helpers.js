/*
    LogUI Client Library
    Helpers Module

    A IIFE function containing several helper methods used throughout the rest of the LogUI client library.

    @module: Helpers
    @author: David Maxwell
    @date: 2020-09-14
*/

export default (function(root) {
    var _helpers = {};

    _helpers.console = function(messageStr, currentState=null) {
        let currentStateString = '';

        if (currentState) {
            currentStateString = ` (${currentState})`;
        }

        if (root.LogUI.Config.getProperty('verbose')) {
            var timeDelta = new Date().getTime() - root.LogUI.Config.getInitTimestamp();
            console.log(`LogUI${currentStateString} @ ${timeDelta}ms > ${messageStr}`);
        }
    };

    _helpers.getElementDescendant = function(rootObject, descendantString=null, separator='.') {
        if (!descendantString || descendantString == []) {
            return rootObject;
        }
        
        let descendantSplitArray = descendantString.split(separator);
        while (descendantSplitArray.length && (rootObject = rootObject[descendantSplitArray.shift()]));

        return rootObject;
    };

    return _helpers;
})(window);