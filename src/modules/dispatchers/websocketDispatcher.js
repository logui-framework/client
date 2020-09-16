/*
    LogUI Client Library
    WebSocket-based Dispatcher

    A WebSocket-based dispatcher that communicates with a LogUI server implementation.

    @module: WebSocket-based Dispatcher
    @author: David Maxwell
    @date: 2020-09-16
*/

import Defaults from '../../defaults';
import RequiredFeatures from '../../required';

Defaults.dispatcher = {
    endpoint: null, // The URL of the WebSocket endpoint to send data to.
    queueSize: 100,  // The maximum number of items in the queue before flushing.
    reconnectAttempts: 5, // The maximum number of times we should try to reconnect.
    reconnectAttemptDelay: 5000 // The delay (in ms) we should wait between reconnect attempts.
}

RequiredFeatures.addFeature('WebSocket');

export default (function(root) {
    var _public = {};

    _public.init = function() {
        //console.log("websocket");
        //console.log(Defaults.dispatcher);
    };

    _public.disconnect = function() {

    };

    _public.requiredAPIs = function() {
        return [WebSocket];
    }
    
    return _public;
})(window);