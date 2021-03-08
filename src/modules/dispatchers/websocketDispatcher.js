/*
    LogUI Client Library
    WebSocket-based Dispatcher

    A WebSocket-based dispatcher that communicates with a LogUI server implementation.

    @module: WebSocket-based Dispatcher
    @author: David Maxwell
    @date: 2020-09-16
*/

import Config from '../config';
import Helpers from '../helpers';
import Defaults from '../defaults';
import RequiredFeatures from '../required';
import ValidationSchemas from '../validationSchemas';

Defaults.dispatcher = {
    endpoint: null,  // The URL of the WebSocket endpoint to send data to.
    authenticationToken: null,  // The string representing the authentication token to connect to the endpoint with.
    queueSize: 100,  // The maximum number of items in the queue before flushing.
    reconnectAttempts: 5,  // The maximum number of times we should try to reconnect.
    reconnectAttemptDelay: 5000  // The delay (in ms) we should wait between reconnect attempts.
};

RequiredFeatures.addFeature('WebSocket');

ValidationSchemas.addLogUIConfigProperty('endpoint', 'string');
ValidationSchemas.addLogUIConfigProperty('authenticationToken', 'string');

export default (function(root) {
    var _public = {};
    var _isActive = false;
    var _websocket = null;
    var _websocketReconnectionAttempts = 0;  // The total number of attempts that have been made to reconnect when the connection drops.
    var _websocketSuccessfulReconnections = 0;  // The total number of times there has been a successful (re)connection.
    var _websocketReconnectionReference = null;  // A reference to the reconnection routine when attempting to reconnect.

    var _cache = null;

    _public.dispatcherType = 'websocket';

    _public.init = function() {
        Config.getConfigProperty('endpoint');

        initWebsocket();

        _cache = [];
        _isActive = true;
        return true;
    };

    _public.stop = async function() {
        tidyWebsocket();

        _websocketReconnectionAttempts = 0;
        _websocketSuccessfulReconnections = 0;
        _websocketReconnectionReference = null;

        _cache = null;
        _isActive = false;
    };

    _public.isActive = function() {
        return _isActive;
    };

    _public.sendObject = function(objectToSend) {
        if (_isActive) {
            _cache.push(objectToSend);

            if (_cache.length == 100) {

            }

            return;
        }

        throw Error('You cannot send a message when LogUI is not active.');
    };

    var initWebsocket = function() {
        _websocket = new WebSocket(Config.getConfigProperty('endpoint'));

        _websocket.addEventListener('close', callbacks.onClose);
        _websocket.addEventListener('error', callbacks.onError);
        _websocket.addEventListener('message', callbacks.onMessage);
        _websocket.addEventListener('open', callbacks.onOpen);
    };

    var tidyWebsocket = function() {
        if (_websocket) {
            Helpers.console(`The connection to the server is being closed.`, 'Dispatcher', true);

            _websocket.removeEventListener('close', callbacks.onClose);
            _websocket.removeEventListener('error', callbacks.onError);
            _websocket.removeEventListener('message', callbacks.onMessage);
            _websocket.removeEventListener('open', callbacks.onOpen);
    
            _websocket.close();
            _websocket = null;
        }
    };

    var attemptReconnect = function() {
        if (_websocket && !_websocketReconnectionReference) {
            tidyWebsocket();

            _websocketReconnectionReference = setInterval(() => {
                if (_websocket) {
                    switch (_websocket.readyState) {
                        case 0:
                            return;
                        case 1:
                            Helpers.console(`The connection to the server has been (re-)established.`, 'Dispatcher', true);

                            clearInterval(_websocketReconnectionReference);
                            _websocketReconnectionAttempts = 0;
                            _websocketReconnectionReference = null;

                            return;
                        default:
                            Helpers.console(`The connection to the server has failed; we are unable to restart.`, 'Dispatcher', true);
                            tidyWebsocket();
                            return;
                    }
                }

                // Counter incremented here to consider the first attempt.
                _websocketReconnectionAttempts += 1;

                if (_websocketReconnectionAttempts == Defaults.dispatcher.reconnectAttempts) {
                    Helpers.console(`We've maxed out the number of permissible reconnection attempts. We must stop here.`, 'Dispatcher', true);

                    clearInterval(_websocketReconnectionReference);
                    root.dispatchEvent(new Event('logUIShutdownRequest'));
                    throw Error('LogUI attempted to reconnect to the server but failed to do so. LogUI is now stopping. Any events not sent to the server will be lost.');

                }
                
                Helpers.console(`(Re-)connection attempt ${_websocketReconnectionAttempts} of ${Defaults.dispatcher.reconnectAttempts}`, 'Dispatcher', true);
                initWebsocket();
            }, Defaults.dispatcher.reconnectAttemptDelay);
        }

    };

    var callbacks = {
        onClose: function(event) {
            Helpers.console(`The connection to the server has been closed.`, 'Dispatcher', true);

            let errorMessage = 'Something went wrong with the connection to the LogUI server.'

            switch (event.code) {
                case 4001:
                    errorMessage = 'A bad message was sent to the LogUI server. LogUI is shutting down.';
                    break;
                case 4002:
                    errorMessage = 'The client sent a bad application handshake to the server. LogUI is shutting down.';
                    break;
                case 4003:
                    errorMessage = 'The LogUI server being connected to does not support v__buildVersion__ of the client. LogUI is shutting down.';
                    break;
                case 4004:
                    errorMessage = 'A bad authentication token was provided to the LogUI server. LogUI is shutting down.';
                    break;
                case 4005:
                    errorMessage = 'The LogUI server did not recognise the domain that this client is being started from. LogUI is shutting down.';
                    break;
                case 4006:
                    errorMessage = 'The LogUI client sent an invalid session ID to the server. LogUI is shutting down.';
                    Config.sessionData.clearSessionIDKey();
                    break;
                default:
                    errorMessage = `${errorMessage} The recorded error code was ${event.code}. LogUI is shutting down.`;
                    break;
            }

            switch (event.code) {
                case 1000:
                    console.log('clean connection closure!');
                    break;
                case 1006:
                    console.log('disconnection. try again to reconnect.');
                    attemptReconnect();
                    break;
                default:
                    root.dispatchEvent(new Event('logUIShutdownRequest'));
                    throw Error(errorMessage);
            }
        },

        onError: function(event) {
            console.log('error');
        },

        onMessage: function(receivedMessage) {
            let messageObject = JSON.parse(receivedMessage.data);

            switch (messageObject.type) {
                case 'handshakeSuccess':
                    Helpers.console(`The handshake was successful. Hurray! The server is listening.`, 'Dispatcher', true);
                    Config.sessionData.setID(messageObject.payload.sessionID);
                    console.log(messageObject.payload.clientStartTimetamp);
                    console.log(new Date(messageObject.payload.clientStartTimetamp));
                    break;
            }
        },

        onOpen: function(event) {
            _websocketSuccessfulReconnections += 1;
            let sessionID = Config.sessionData.getSessionIDKey();

            Helpers.console(`The connection to the server has been established.`, 'Dispatcher', true);
            
            let payload = {
                clientVersion: '__buildVersion__',
                authenticationToken: Config.getConfigProperty('authenticationToken'),
                pageOrigin: root.location.origin,
                userAgent: root.navigator.userAgent,
            };

            if (sessionID) {
                payload.sessionID = Config.sessionData.getSessionIDKey();
            }

            Helpers.console(`The LogUI handshake has been sent.`, 'Dispatcher', true);
            _websocket.send(JSON.stringify(getMessageObject('handshake', payload)));
        },

    };

    var getMessageObject = function(messageType, payload) {
        return {
            sender: 'logUIClient',
            type: messageType,
            payload: payload,
        };
    };

    var flushCache = function() {

    };

    // var getSessionDetails = function() {
    //     let currentTimestamp = new Date();

    //     if (Config.sessionData.getSessionIDKey()) {
    //         Config.sessionData.setIDFromSession();
    //         Config.sessionData.setTimestamps(currentTimestamp, currentTimestamp); // The first date should come from the server (for the session start time).

    //         //return false; // If the server disagrees with the key supplied, you'd return false here to fail the initialisation.
    //     }
    //     else {
    //         // Create a new session.
    //         // For the websocket dispatcher, we'd send off a blank session ID field, and it will return a new one.
    //         Config.sessionData.setID('CONSOLE-SESSION-ID'); // ID should come from the server in the websocket dispatcher.
    //         Config.sessionData.setTimestamps(currentTimestamp, currentTimestamp);
    //     }

    //     return true;
    // };

    _public.testFire = function(obj) {
        _websocket.send(JSON.stringify(obj));
    }


    
    return _public;
})(window);