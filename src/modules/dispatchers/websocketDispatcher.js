/*
    LogUI Client Library
    WebSocket-based Dispatcher

    A WebSocket-based dispatcher that communicates with a LogUI server implementation.

    @module: WebSocket-based Dispatcher
    @author: David Maxwell
    @date: 2021-03-08
*/

import Config from '../config';
import Helpers from '../helpers';
import Defaults from '../defaults';
import RequiredFeatures from '../required';
import ValidationSchemas from '../validationSchemas';

Defaults.dispatcher = {
    endpoint: null,  // The URL of the WebSocket endpoint to send data to.
    authorisationToken: null,  // The string representing the authentication token to connect to the endpoint with.
    cacheSize: 10,  // The maximum number of stored events that can be in the cache before flushing.
    maximumCacheSize: 1000,  // When no connection is present, this is the cache size we shut down LogUI at.
    reconnectAttempts: 5,  // The maximum number of times we should try to reconnect.
    reconnectAttemptDelay: 5000  // The delay (in ms) we should wait between reconnect attempts.
};

RequiredFeatures.addFeature('WebSocket');

ValidationSchemas.addLogUIConfigProperty('endpoint', 'string');
ValidationSchemas.addLogUIConfigProperty('authorisationToken', 'string');

export default (function(root) {
    var _public = {};
    var _isActive = false;
    var _websocket = null;
    var _websocketReconnectionAttempts = 0;  // The total number of attempts that have been made to reconnect when the connection drops.
    var _websocketSuccessfulReconnections = 0;  // The total number of times there has been a successful (re)connection.
    var _websocketReconnectionReference = null;  // A reference to the reconnection routine when attempting to reconnect.
    var _libraryLoadTimestamp = null;  // The time at which the dispatcher loads -- for measuring the beginning of a session more accurately.

    var _cache = null;
    var _blobcache = null;

    _public.dispatcherType = 'websocket';

    _public.init = function() {
        Config.getConfigProperty('endpoint');

        // We may restart the dispatcher in the same context.
        // There may still be a timer active from the previous iteration.
        // If so, we cancel it.
        if (_websocketReconnectionReference) {
            clearInterval(_websocketReconnectionReference);
            _websocketReconnectionReference = null;
        }

        _initWebsocket();

        _cache = [];
        _blobcache = [];
        _isActive = true;
        return true;
    };

    _public.stop = async function() {
        _flushCache();
        _tidyWebsocket();

        _websocketReconnectionAttempts = 0;
        _websocketSuccessfulReconnections = 0;
        _libraryLoadTimestamp = null;

        if (_websocketReconnectionReference) {
            clearInterval(_websocketReconnectionReference);
        }

        _cache = null;
        _isActive = false;
    };

    _public.isActive = function() {
        return _isActive;
    };

    _public.sendObject = function(objectToSend) {
        if (_isActive) {
            if(objectToSend instanceof Blob){
                _blobcache.push(objectToSend);
                Helpers.console(objectToSend, 'Dispatcher', false);

                // if (_blobcache.length >= Defaults.dispatcher.cacheSize) {
                //     _flushCache();
                // }
            } 
            else{
                _cache.push(objectToSend);
                Helpers.console(objectToSend, 'Dispatcher', false);

                
            }
            if (_cache.length + _blobcache.length >= Defaults.dispatcher.cacheSize) {
                                _flushCache();
                            }
            return;
        }

        throw Error('You cannot send a message when LogUI is not active.');
    };

    var _initWebsocket = function() {
        _websocket = new WebSocket(Config.getConfigProperty('endpoint'));

        _websocket.addEventListener('close', _callbacks.onClose);
        _websocket.addEventListener('error', _callbacks.onError);
        _websocket.addEventListener('message', _callbacks.onMessage);
        _websocket.addEventListener('open', _callbacks.onOpen);
    };

    var _tidyWebsocket = function() {
        if (_websocket) {
            Helpers.console(`The connection to the server is being closed.`, 'Dispatcher', false);

            _websocket.removeEventListener('close', _callbacks.onClose);
            _websocket.removeEventListener('error', _callbacks.onError);
            _websocket.removeEventListener('message', _callbacks.onMessage);
            _websocket.removeEventListener('open', _callbacks.onOpen);
    
            _websocket.close();
            _websocket = null;
        }
    };

    var _attemptReconnect = function() {
        if (_websocket && !_websocketReconnectionReference) {
            _tidyWebsocket();

            _websocketReconnectionReference = setInterval(() => {
                if (_isActive) {
                    if (_websocket) {
                        switch (_websocket.readyState) {
                            case 0:
                                return;
                            case 1:
                                Helpers.console(`The connection to the server has been (re-)established.`, 'Dispatcher', false);

                                clearInterval(_websocketReconnectionReference);
                                _websocketReconnectionAttempts = 0;
                                _websocketReconnectionReference = null;

                                return;
                            default:
                                Helpers.console(`The connection to the server has failed; we are unable to restart.`, 'Dispatcher', true);
                                _tidyWebsocket();
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
                    
                    Helpers.console(`(Re-)connection attempt ${_websocketReconnectionAttempts} of ${Defaults.dispatcher.reconnectAttempts}`, 'Dispatcher', false);
                    _initWebsocket();
                }
                else {
                    // Here, the instance of LogUI has already been stopped.
                    // So just silently clear the timer -- and reset the referene back to null.
                    clearInterval(_websocketReconnectionReference);
                    _websocketReconnectionReference = null;

                }
            }, Defaults.dispatcher.reconnectAttemptDelay);
        }

    };

    var _callbacks = {
        onClose: function(event) {
            Helpers.console(`The connection to the server has been closed.`, 'Dispatcher', false);

            let errorMessage = 'Something went wrong with the connection to the LogUI server.'

            switch (event.code) {
                case 4001:
                    errorMessage = 'A bad message was sent to the LogUI server. LogUI is shutting down.';
                    break;
                case 4002:
                    errorMessage = 'The client sent a bad application handshake to the server. LogUI is shutting down.';
                    break;
                case 4003:
                    errorMessage = 'The LogUI server being connected to does not support version __buildVersion__ of the client. LogUI is shutting down.';
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
                case 4007:
                    errorMessage = 'The LogUI server is not accepting new connections for this application at present.';
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
                    _attemptReconnect();
                    break;
                default:
                    root.dispatchEvent(new Event('logUIShutdownRequest'));
                    throw Error(errorMessage);
            }
        },

        onError: function(event) { },

        onMessage: function(receivedMessage) {
            let messageObject = JSON.parse(receivedMessage.data);

            switch (messageObject.type) {
                case 'handshakeSuccess':
                    Helpers.console(`The handshake was successful. Hurray! The server is listening.`, 'Dispatcher', false);
                    Config.sessionData.setID(messageObject.payload.sessionID);

                    if (messageObject.payload.newSessionCreated) {
                        Config.sessionData.setTimestamps(new Date(messageObject.payload.clientStartTimestamp), new Date(messageObject.payload.clientStartTimestamp));
                    }
                    else {
                        Config.sessionData.setTimestamps(new Date(messageObject.payload.clientStartTimestamp), new Date());
                        
                        if (_cache.length >= Defaults.dispatcher.cacheSize) {
                            _flushCache();
                        }
                    }

                    // ADD CALL HERE
                    root.dispatchEvent(new Event('logUIStarted'));
                    break;
            }
        },

        onOpen: function(event) {
            _websocketSuccessfulReconnections += 1;
            let sessionID = Config.sessionData.getSessionIDKey();

            Helpers.console(`The connection to the server has been established.`, 'Dispatcher', false);
            
            let payload = {
                clientVersion: '__buildVersion__',
                authorisationToken: Config.getConfigProperty('authorisationToken'),
                pageOrigin: root.location.origin,
                userAgent: root.navigator.userAgent,
                clientTimestamp: new Date(),
            };

            if (sessionID) {
                payload.sessionID = Config.sessionData.getSessionIDKey();
            }

            Helpers.console(`The LogUI handshake has been sent.`, 'Dispatcher', false);
            _websocket.send(JSON.stringify(_getMessageObject('handshake', payload)));
        },

    };

    var _getMessageObject = function(messageType, payload) {
        return {
            sender: 'logUIClient',
            type: messageType,
            payload: payload,
        };
    };

    var _flushCache = function() {
        if (!_websocket || _websocket.readyState != 1) {
            if (_cache.length >= Defaults.dispatcher.maximumCacheSize) {
                Helpers.console(`The cache has grown too large, with no connection to clear it. LogUI will now stop; any cached events will be lost.`, 'Dispatcher', false);
                root.dispatchEvent(new Event('logUIShutdownRequest'));
            }

            return;
        }

        let payload = {
            length: _cache.length,
            items: _cache,
        };

        _websocket.send(JSON.stringify(_getMessageObject('logEvents', payload)));

        _blobcache.forEach(chunk => {
            _websocket.send(chunk);

        });

        Helpers.console(`Cache flushed.`, 'Dispatcher', false);


        _cache = [];
        _blobcache = [];
    };
    
    return _public;
})(window);