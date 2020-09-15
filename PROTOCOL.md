# LogUI Communication Protocol <a href="https://www.logui.net"><img align="right" width="85" src="./.meta/logui.svg" /></a>

This document outlines the protocol that exists between the LogUI Client and LogUI Server. **Consider this page to be the definitive guide for the LogUI communication protocol.**

Last Updated | Changed By
-------------|--------------
2020-09-15   | David Maxwell

## Protocol Stages

The protocol establishes a sequence of stages that take place over the WebSocket connection between the client and server. All exchanges take place via standard WebSocket calls after the HTTP layer establishes a connection.

1. **WebSocket Connection**
    The LogUI client creates a connection to the LogUI logging endpoint.

2. **LogUI Handshake**
    Handshake.

3. **Event Listening**
    The server then waits for events and logs them as they are sent by the client.

4. **WebSocket Disconnection**
    Disconnect. The disconnect can be triggered by either the client or the server.

Of course, there are several possible responses to each of the above stages. Things can go wrong! Hopefully, this protocol allows each party to be aware of each other's state, and act accordingly. We now take each stage in turn, providing detailed explanations of what exactly happens during these stages. We also include example messages to demonstrate the functionality of the procotol.

### WebSocket Connection

### LogUI Handshake

### Event Listening

### WebSocket Disconnection

## Possible Server Responses

Number | Type | Disconnect?   | Metadata | Description
-------|------|---------------|----------|------------
200    | `logui-do-something` | No | Meta | Desc.



<!-- OLD BELOW
==================

1) Socket connection established.
    * Endpoint should be specific to the logging library version.
        i.e. http://127.0.0.1:8081/logui/endpoint/0.4.0/

2) Client sends handshake request

    * If appSpecificLogData is not required, send empty curly braces.
    * All four keys must be present.
    * Identifier object is signed by the server. String converted to dictionary and checked.
      Key is signed by the server. You need to get a key from the server to log.
    * The request should also include the domain to check against.

FROM CLIENT
{
    'payloadType': 'LogUIHandshake',
    'clientDateTime': 'UNIX TIMESTAMP',
    'appIdentifier': {
        appID: 'AppIDString',
        flightID: 'FlightIDString',
        clientVersion: '0.4.0'
    },
    'appSpecificLogData': {
        'userID': '123',
        'condition': '456',
        'experimentID': 'someID'
    }
}

2a) If the request is:
        * badly formed (i.e. missing fields);
        * has a bad identifier key
        * is a mismatched version
    
    The request is rejected. A response is sent, and the connection is terminated by the server.
    Library shuts down.

FROM SERVER
{
    'responseType': 'LogUIHandshakeError',
    'statusCode': '400',
    'errorDetails': {
        'errorString': 'Message for rejection goes here.',
        'terminate': true
    }
}

2b) If the request for logging is valid, and the domain checks out, the connection remains with a success message sent back.
    From this point, the server is ready to listen to events from the client.
    Any bad requests from this point are ignored and the connection stays open. Five hits. Five bad requests, connection drops.
    * We send back a UUID sessionIdentifier that the server is appending to all logged entries.

FROM SERVER
{
    'responseType': 'LogUIHandshakeSuccess',
    'statusCode': '200',
    'sessionIdentifier': 'uuid code'
}

    When five hits of invalid requests have been made, we drop the connection with this message.

FROM SERVER
{
    'responseType': 'LogUIBadRequestCountExceeded',
    'statusCode': '402',
    'errorDetails': {
        'errorString': 'The number of bad requests has been exceeded.',
        'terminate': true
    }
}

    Before the magic number has been hit, a bad request message is sent.
    The connection does not drop; this is a warning!

FROM SERVER
{
    'responseType': 'LogUIBadRequest',
    'statusCode': '401',
    'errorDetails': {
        'errorString': 'The server did not understand the request.',
        'terminate': false
    }
}

3) If the user wishes to add more appSpecificLogData after the connection has been established, this sequence of events must be followed.
    * This can also be used to CHANGE the value being used. Provide the new value. If you want to delete one, you provide null as the value.
    * In the example below, condition is deleted (from '456' above).
    * We set completedTask to true.
    * You can use this to manage state on a page, as major events happen.

FROM CLIENT
{
    'payloadType': 'LogUIAppSpecificLogDataChange',
    'appSpecificLogData': {
        'condition': null,
        'completedTask': true,
    }
}

3a) If the server understands the request (i.e. no LogUIBadRequest), then we receive a confirmation message.

FROM SERVER
{
    'responseType': 'LogUIAppSpecificLogDataChangeSuccess',
    'statusCode': '201'
}

    * The client does not need to do anything here.
    * A status code of 201 means nothing needs to be done on the client's side, the message is merely providing an update.

4) When enough data (logged events) has been stored in the buffer, the client needs to send them down the socket in a payload.
    * EventsToBeLogged is an array of variable length.
    * The server assumes that the events are stored in chronological order.
    * The content of each event can vary (for obvious reasons); there are however several fields which are always present.
        a) clientDateTime
        b) ...

FROM CLIENT
{
    'payloadType': 'LogUIEventPayload',
    'eventsToBeLogged': [
        {},
        {},
        {},
        {},...
    ]
}

The server processes and stores the events.

4a) If a required field is missing in one or more of the events, the server sends a 403.
    * This counts towards the bad requests count.
    * This differs from a 401 as additional information is provided to highlight what the problem was.
    * Note that this is only sent for the first event that is found to be malformed, if more than one is present.

    * If the payload from the client is missing eventsToBeLogged, a 401 is sent instead. This also counts towards your hit limit.

FROM SERVER
{
    'responseType': 'LogUIBadEventPayloadRequest',
    'statusCode': '403',
    'errorDetails': {
        'errorString': 'The event payload was badly formed at position [x].',
        'badEventData': { /* A copy of the badly formed event object. */ },
        'terminate': false
    }
}

4b) If the events were all correct and stored, we send a success response. This does not need to be acted on.

FROM SERVER
{
    'responseType': 'LogUIEventPayloadSuccess',
    'statusCode': '201'
}

5) There are two reasons why the client disconnects from the server:
    * a) because the user moves away from the page, causing the library to be unloaded; or
    * b) the client programmatically turns the logger off.

    In either case, we need to flush the buffer.
    As such, we send a LogUIEventPayload event with a 'session' attribute.

    When the server receives and successfully saves this content, it ends the connection.
    There is no response.
    The client will be assumed to end the connection from its side once this payload has been sent.

FROM CLIENT
{
    'payloadType': 'LogUIEventPayload',
    'session': 'leavingPage', // Alternatively, 'shutdownClient' is used when the client is programmatically stopped.
    'eventsToBeLogged': [
        {},
        {},
        {},
        {},...
    ]
}

6) If the server needs to disconnect, for whatever reason, the server will send a LogUIServerShutdown response.
    * The client should send it's payload over immediatley.
    * The server can disconnect at any time from that point.
    * The client should attempt to reconnect according to the reconnect protocol.

FROM SERVER
{
    'responseType': 'LogUIServerShutdown',
    'statusCode': '501',
}

7) If the server messes up in some other way, we send back a 500.
    * If the error is severe enough to warrant disconnection, terminate is set to true.
    * If terminate is not set to true, the client can continue sending data as normal.

FROM SERVER
{
    'responseType': 'LogUIServerError',
    'statusCode': '500',
    'errorDetails': {
        'errorString': 'Reason for error here.',
        'terminate': true
    }
} -->