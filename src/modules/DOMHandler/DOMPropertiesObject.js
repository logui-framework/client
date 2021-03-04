/*
    LogUI Client Library
    DOM Properties Object Factory Module

    IIFE function that provides a factory for DOM Properties objects, which are stored in the Config WeakMap.

    @module: DOM Properties Object Factory
    @author: David Maxwell
    @date: 2020-03-02
*/

export default (function(root) {

    var createObject = function(groupObject) {
        let newDOMPropertiesObject = {
            events: {},

            hasEvent: function(eventName) {
                if (newDOMPropertiesObject['events'].hasOwnProperty(eventName)) {
                    return true;
                }

                return false;
            },

            getEventGroupName: function(eventName) {
                if (newDOMPropertiesObject.hasEvent(eventName)) {
                    return newDOMPropertiesObject['events'][eventName];
                }

                return false;
            },

            getEventList: function*() {
                for (let eventName in newDOMPropertiesObject['events']) {
                    yield eventName;
                }
            },

            deleteEventsWithGroup: function(groupName) {
                for (let event in newDOMPropertiesObject['events']) {
                    if (newDOMPropertiesObject.getEventGroupName(event) == groupName) {
                        newDOMPropertiesObject.deleteEvent(event);
                    }
                }
            },

            deleteEvent: function(eventName) {
                delete newDOMPropertiesObject['events'][eventName];
            },

            setEvent: function(eventName, groupName) {
                newDOMPropertiesObject['events'][eventName] = groupName;
            },
        };

        for (let event of groupObject.eventsList) {
            newDOMPropertiesObject['events'][event] = groupObject.name;
        }

        return newDOMPropertiesObject;
    };

    return createObject;
})(window);