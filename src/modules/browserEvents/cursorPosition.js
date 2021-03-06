/*
    LogUI Client Library
    Browser Events / Mouse Tracker Module

    A IIFE function yielding a module that provides functionality for tracking mouse movements.

    @module: URL Change Browser Event
    @author: David Maxwell
    @date: 2021-03-02
*/

import Config from '../config';
import EventPackager from './../eventPackager';

const CURSORPOSITION_TRACK_FREQUENCY = 200;

export default (function(root) {
    var _handler = {};
    var _trackLeaving = null;
    var _updateFrequency = CURSORPOSITION_TRACK_FREQUENCY;
    var _updateIntervalID = null;
    
    var _lastEvent = null;
    var _hadFocus = null;

    _handler.init = function() {
        if (Config.browserEventsConfig.get('trackCursor', true)) {
            let configUpdateFrequencyValue = Config.browserEventsConfig.get('cursorUpdateFrequency', CURSORPOSITION_TRACK_FREQUENCY);

            if (configUpdateFrequencyValue <= 0) {
                _updateFrequency = false;
            }
            else {
                _updateFrequency = configUpdateFrequencyValue;
            }

            _trackLeaving = Config.browserEventsConfig.get('cursorLeavingPage', true)

            root.document.addEventListener('mousemove', movementCallback);

            if (_trackLeaving) {
                root.document.addEventListener('mouseleave', pageLeaveCallback);
                root.document.addEventListener('mouseenter', pageEnterCallback);
            }

            intervalTimerSet();
        }
    };

    _handler.stop = function() {
        root.document.removeEventListener('mousemove', movementCallback);
        root.document.removeEventListener('mouseleave', pageLeaveCallback);
        root.document.removeEventListener('mouseenter', pageEnterCallback);
        
        intervalTimerClear();
        _trackLeaving = null;
        _updateFrequency = CURSORPOSITION_TRACK_FREQUENCY;
        _lastEvent = null;
        _hadFocus = null;
    };

    var movementCallback = function(event) {
        if (!_updateFrequency) {
            handleMousePosition(event, root.document.hasFocus());
        }

        _lastEvent = event;
        _hadFocus = root.document.hasFocus();
    };

    var intervalTimerCallback = function() {
        if (!_lastEvent) {
            return;
        }

        handleMousePosition(_lastEvent, _hadFocus);
    };

    var intervalTimerSet = function() {
        if (_updateFrequency) {
            _updateIntervalID = setInterval(intervalTimerCallback, _updateFrequency); 
        }
    };

    var intervalTimerClear = function() {
        clearInterval(_updateIntervalID);
        _updateIntervalID = null;
    };

    var getBasicTrackingObject = function(event, hasFocus) {
        return {
            clientX: event.clientX,
            clientY: event.clientY,
            screenX: event.screenX,
            screenY: event.screenY,
            pageX: event.pageX,
            pageY: event.pageY,
            pageHadFocus: hasFocus,
        };
    }

    var handleMousePosition = function(event, hasFocus) {
        let returnObject = getBasicTrackingObject(event, hasFocus);
        returnObject.type = 'cursorTracking';
        returnObject.trackingType = 'positionUpdate';

        EventPackager.packageBrowserEvent(returnObject);
    }

    var pageLeaveCallback = function(event) {
        let returnObject = getBasicTrackingObject(event, _hadFocus);
        returnObject.type = 'cursorTracking';
        returnObject.trackingType = 'cursorLeftViewport';

        intervalTimerClear();
        EventPackager.packageBrowserEvent(returnObject);
    }

    var pageEnterCallback = function(event) {
        let returnObject = getBasicTrackingObject(event, _hadFocus);
        returnObject.type = 'cursorTracking';
        returnObject.trackingType = 'cursorEnteredViewport';

        intervalTimerSet();
        EventPackager.packageBrowserEvent(returnObject);
    };

    return _handler;
})(window);