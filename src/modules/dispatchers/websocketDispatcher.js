/*
    LogUI Client Library
    WebSocket-based Dispatcher

    A WebSocket-based dispatcher that communicates with a LogUI server implementation.

    @module: WebSocket-based Dispatcher
    @author: David Maxwell
    @date: 2020-09-16
*/

import Config from '../config';
import Defaults from '../defaults';
import RequiredFeatures from '../required';
import ValidationSchemas from '../validationSchemas';

Defaults.dispatcher = {
    endpoint: null, // The URL of the WebSocket endpoint to send data to.
    queueSize: 100,  // The maximum number of items in the queue before flushing.
    reconnectAttempts: 5, // The maximum number of times we should try to reconnect.
    reconnectAttemptDelay: 5000 // The delay (in ms) we should wait between reconnect attempts.
};

RequiredFeatures.addFeature('WebSocket');

ValidationSchemas.addLogUIConfigProperty('endpoint', 'string');

export default (function(root) {
    var _public = {};
    _public.dispatcherType = 'websocket';

    _public.init = function() {
        //console.log(Config.getConfigProperty('sessionUUID'));
        return true;
    };

    _public.disconnect = function() {

    };
    
    return _public;
})(window);