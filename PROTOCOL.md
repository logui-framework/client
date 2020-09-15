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
This stage is handled by the [WebSockets Web API](https://developer.mozilla.org/en-US/docs/Web/API/Websockets_API). A connection to the LogUI logging endpoint is established by the aforementioned APIs. Once a connection has been established, we move to the LogUI handshake stage.

### LogUI Handshake
The LogUI handshake stage provides the server with basic authentication details that allow the server to determine whether or not it should be listening to the client attempting to establish a connection. Information sent to the server includes the `appIdentifier` string, an encrypted string that when decrypted reveals what application is being logged, and the version of the LogUI client library being used. Information can be checked by the server against a database of known applications. If anything doesn't match, the server will refuse to serve the client and disconnect.

The LogUI handshake **must be the first message sent by the client.** If anything else is sent down the WebSocket to the server, the server will disconnect immediately. If the server does not receive the handshake within the first three seconds, the server will also disconnect.

#### Complete LogUI Handshake Example
A complete LogUI handshake request sent by the client, complete with sample data, is shown below. **Note that `appIdentifier` is expanded to its full representation** (it would nominally be represented by a single, encrypted string -- more below).

```json
{
    "messageType": "logui-handshake-request",
    "sessionUUID": "ce2a6120-a78e-45e9-86c7-29df8225494d",
    "clientTimestamp": "641143800",
    "clientVersion": "0.4.0",
    "applicationIdentifier": { // Nominally represented as a single string
        "applicationID": "9587489a-2bc3-4f49-a795-b2298408fc49",
        "flightID": "fc7af2c8-4d39-4ad0-b287-7a2c1e3a60b1",
        "expectedClientVersion": "0.4.0"
    },
    "applicationSpecificData": {
        "userID": "exp-user-26",
        "condition": "c2",
    }
}
```

Let's now walk through each of the individual components of this payload sent to the server. We'll discuss what each key/value pairing represents, and what other values can be provided (for example, if no `sessionUUID` is available).

##### `messageType`
This field is a requirement for all messages sent from the LogUI to the server. A `messageType` of `logui-handshake-request` indicates to the server that the remainder of the message will contain information pertaining to a handshake. As such, the server then knows what other fields to expect.

##### `sessionUUID`
The `sessionUUID` is a unique session identifier. It identifies the browser tab that has been open, if previous pages with LogUI tracking on the same origin were present. The `sessionUUID` is handled entirely by the client-side library; refer to the documentation of that library for more information. If *no previous page has been loaded* in the same tab or browser session, the value for `sessionUUID` will be set to `null`.

##### `clientTimestamp`
The field `clientTimestamp` must provide the UNIX timestamp for the browser at the point the client sends the handshake request. This timestamp is used by the LogUI server to synchronise the client's time against the server's time, and provides a point in time that logged events can be measured from in absolute terms.

##### `clientVersion`
`clientVersion` reports the version of the LogUI client library that is being used to issue the handshake request. In the example above, version `0.4.0` is shown. If the version of the LogUI client library is not compatible with the LogUI server being connected to, the handshake is considered invalid.

##### `applicationIdentifier`
The `applicationIdentifier` field contains a number of subfields that are used by the LogUI server to verify who is attempting to authenticate. The following fields are what the complete data structure should look like when decrypted by the LogUI server.

###### `applicationID`
The `applicationID` is the identifier for the specific application entry in the LogUI server database. If the supplied identifier does not match, the handshake is assumed to be invalid.

It should be also noted that a given `applicationID` is *tied against a specific domain.* If the domain the server that is hosting the LogUI client library does not match the recorded domain, the handshake is also assumed to be invalid. This is to prevent an `applicationID` code being hijacked and used elsewhere.

###### `flightID`
The `flightID` is a sub-identifier for the application, allowing for different configurations of application within the same `applicationID`. Like the `applicationID` above, a comparison is made against the LogUI server's database. If no match is found, the handshake is considered to be invalid.

###### `expectedClientVersion`
The final field `expectedClientVersion` dictates what version of the LogUI client has been paired with the `applicationID`. This is to allow for the tying of one specific version of LogUI to an application. If the expected version is not what is reported by the LogUI client itself (in `clientVersion` above), the handshake is rejected.

###### (Encrypted) String Representation
Given the sensitive nature of the above three fields, information in `applicationIdentifier` is not sent to the LogUI server in its expanded state. Rather, the `applicationIdentifier` object is converted to a string and encrypted, with this string being sent to the LogUI server on a handshake request instead. This string will be acquired by the developer wishing to integrate LogUI into their web application.

To give a complete example of `applicationIdentifier`, the above example is encrypted to yield this portion of the handshake request.

```json
{
    ...
    "applicationIdentifier": "ZXlKaGNIQnNhV05oZEdsdmJrbEVJam9pT1RVNE56UTRPV0V0TW1Kak15MDBaalE1TFdFM09UVXRZakl5T1RnME1EaG1ZelE1SWl3aVpteHBaMmgwU1VRaU9pSm1ZemRoWmpKak9DMDBaRE01TFRSaFpEQXRZakk0TnkwM1lUSmpNV1V6WVRZd1lqRWlMQ0psZUhCbFkzUmxaRU5zYVdWdWRGWmxjbk5wYjI0aU9pSXdMalF1TUNKOToxa0lDS206Ym9rWkF3d3lLeU10ZTcwUGZ5N3JkZTBValgwVk9RN2JyTHgwUDY2X1IzNA==",
    ...
}
```

##### `applicationSpecificData`
This final field of the handshake again consists of subfields. Here, the developer who is using LogUI can include additional information to be included as part of log events that are specific to the developer's application. For example, the developer may have an application-specific `userID` that they wish to include, or a `condition` field. These values will be stored with each logged event.

If no application-specific fields are required, this field **must** be present; simply present an empty pair of JSON curly braces, like so.

```json
{
    ...
    "applicationSpecificData": {}
    ...
}
```

#### Valid Handshake Request
If the `logui-handshake-request` sent to the LogUI server is considered to be valid, the server will then send a response back down the connected WebSocket like the one below.

```json
{
    "messageType": "logui-handshake-success",
    "sessionIdentifier": "ce2a6120-a78e-45e9-86c7-29df8225494d"
}
```

This simple response denotes that the handshake request was a success.

In addition to the successful handshake indication, the response also provides an additional field, `sessionIdentifier`. If this was provided as part of the original handshake request, the same UUID will be provided here. **However, if no UUID was given in the original handshake request, the UUID provided in `sessionIdentifier` denotes a new session identifier.** This UUID should be stored and sent as part of handshake requests for future initialisations of LogUI (of course, only within the same browser session).

Once this message has been sent from the LogUI server, one can assume that the server then transitions to the next stage, [Event Listening](#event-listening).

#### Bad Handshake Request
If the handshake request fails for whatever reason, a response is returned that outlines the cause of the failure.

```json
{
    "messageType": "logui-handshake-failure",
    "failureDetails": {
        "failureCode": 10,
        "terminateConnection": true
    }
}
```

This `messageType` indicates that the handshake failed (`logui-handshake-failure`). A more specific `errorDetails` field is provided with two subfields. Refer to [later in this guide](#logui-server-failure-responses) for more information on error responses.

After this response has been sent to the client, the server will close the WebSocket.



<!-- 2a) If the request is:
        * badly formed (i.e. missing fields);
        * has a bad identifier key
        * is a mismatched version
    
    The request is rejected. A response is sent, and the connection is terminated by the server.
    Library shuts down. -->

### Event Listening

### WebSocket Disconnection

## LogUI Server Failure Responses
If a request sent to the LogUI server results in some kind of failure, the specific failure type is sent back via `messageType`, with details specific to the failure reported in the `errorDetails` field. This contains at least two subfields:

* `errorCode`, reporting a specific failure code (unique to the type of failure); and
* `terminateConnection`, a boolean indicating whether the failure is severe enough to warrant a closing of the WebSocket.

Some failures cannot be recovered from. For example, a `logui-handshake-failure` denotes that the handshake failed. With the authentication process not complete, the LogUI server will not take loggable events. Thus, the WebSocket connection is no longer required. See the example below.

```json
{
    "messageType": "logui-handshake-failure",
    "failureDetails": {
        "failureCode": 10,
        "terminateConnection": true
    }
}
```

Some failures can be recovered from! In these scenarios, the server will respond with `terminateConnection` to `false`. If set to `true`, the server will be expected to close the WebSocket connection. The WebSocket connection should only be closed from the LogUI client side when:

1) the user instructs their browser to navigate to a different page, thus forcing the LogUI client library to close; or
2) the developer integrating the LogUI library instructs it to close (via the LogUI client API).

In some failure scenarios, additional metadata about the failure may be present in the `failureDetails` field. However, one can be assured that the `failureCode` and `terminateConnection` fields will be present in all failure scenarios.

The following subsections report the possible `failureCode` values possible for each failure type.

### `logui-handshake-failure`
With this type of failure, the LogUI handshake was not successful. In all scenarios, the WebSocket connection will be terminated. Failure codes `10` through `19` are devoted to this failure type.

* **Code `10` (Generic)**
    A generic failure code for `logui-handshake-failure`. Not documented here.

* **Code `11` (Badly Formatted)**
    One or more fields missing from the handshake request.

* **Code `12` (Bad `applicationIdentifier` String)**
    An invalid `applicationIdentifier` string was supplied. Decryption failure.

* **Code `13` (Unknown Application or Flight ID)**
    An unknown `applicationID` or `flightID` were supplied. One did not match against the database.

* **Code `14` (Version Mismatch)**
    A mismatched version was supplied from the `applicationIdentifier` string. A version of the LogUI Client library is being used that does not match with what is expected.

* **Code `15` (Unsupported Client Version)**
    An unsupported LogUI client version is being used with the LogUI server endpoint.



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
    'sessionUUID':
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