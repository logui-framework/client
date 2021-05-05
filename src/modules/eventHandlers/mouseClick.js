/*
    LogUI Client Library
    Event Handlers / Mouse Click Group Event

    A IIFE function yielding a generic mouse click event.

    @module: Mouse Click Event Handler
    @author: David Maxwell
    @date: 2021-05-05
*/

import RequiredFeatures from '../required';

RequiredFeatures.addFeature('WeakMap');

export default (function(root) {
    var _handler = {};
    var _currentMouseOver = null;

    _handler.browserEvents = ['mousedown', 'mouseup'];

    _handler.init = function() {
        _currentMouseOver = new WeakMap();
        return;
    }

    _handler.stop = function() {
        _currentMouseOver = null;
    }

    _handler.logUIEventCallback = function(eventContext, browserEvent, trackingConfig) {
        if (browserEvent.type == 'mousedown') {
            _currentMouseOver.set(eventContext, browserEvent.timeStamp);
        }

        if (browserEvent.type == 'mouseup') {
            if (_currentMouseOver.has(eventContext)) {
                let difference = browserEvent.timeStamp - _currentMouseOver.get(eventContext);
                let button = browserEvent.button;
                let properties = getButtonConfig(trackingConfig, button);

                if (!properties) {
                    // If no properties are specified, we ignore the event.
                    return;
                }
                
                // If we get here, we should log this event.
                // Construct the returnObject, and send it back. This gets sent to the EventPackager.
                let returnObject = {};
                returnObject['clickDuration'] = difference;
                returnObject['type'] = 'mouseClick';
                returnObject['button'] = properties.mapping;
                
                if ('name' in properties) {
                    returnObject['name'] = properties.name;
                }

                _currentMouseOver.delete(eventContext);
                return returnObject;
            }
        }

    };

    var getButtonConfig = function(trackingConfig, button) {
        // Given a button number (0, 1, 2...), return the properties for that button.
        // Mappings: primary (0), auxiliary (1), secondary (2)
        if (!trackingConfig.properties) {
            // No properties object was found for the given configuration.
            return;
        }

        let mapping = {
            0: 'primary',
            1: 'auxiliary',
            2: 'secondary',
            3: 'auxiliary2',
            4: 'auxiliary3',
        };

        if (!(button in mapping)) {
            // The button ID clicked doesn't have a mapping in the object above.
            return;
        }

        if (!trackingConfig.properties[mapping[button]]) {
            // No configuration was found for the given mapping (e.g., no primary, auxiliary, secondary).
            return;
        }

        trackingConfig.properties[mapping[button]].mapping = mapping[button];
        return trackingConfig.properties[mapping[button]];
    }

    return _handler;
})(window);

