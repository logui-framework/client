# LogUI Communication Protocol <a href="https://www.logui.net"><img align="right" width="85" src="./.meta/logui.svg" /></a>

This document outlines the protocol that exists between the LogUI Client and LogUI Server. **Consider this page to be the definitive guide for the LogUI communication protocol.**

Last Updated | Changed By
-------------|--------------
2020-09-15   | David Maxwell

## TODOs

- [x] Outline protocol
- [x] Provide error codes
- [ ] Include description of minimum viable event description
- [ ] Diagram of process
- [x] WebSocket Connection
- [x] LogUI Handshake
- [x] Event Listening
- [x] Application-Specific Changing
- [x] WebSocket Disconnection

## Protocol Stages

The protocol establishes a sequence of stages that take place over the WebSocket connection between the client and server. All exchanges take place via standard WebSocket calls after the HTTP layer establishes a connection.

1. **WebSocket Connection**
    The LogUI client creates a connection to the LogUI logging endpoint.

2. **LogUI Handshake**
    The handshake that establishes identity.

3. **Event Listening**
    The server then waits for events and logs them as they are sent by the client. The client may also request to update the [application-specific information](#logui-handshake) stored for each logged event.

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
        "askedForHelp": true
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
This final field of the handshake again consists of subfields. Here, the developer who is using LogUI can include additional information to be included as part of log events that are specific to the developer's application. For example, the developer may have an application-specific `userID` that they wish to include, or a `condition` or `askedForHelp` field. These values will be stored with each logged event. Nested fields can also be included if this is desired -- the entire set of properties are transferred to each logged event.

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

This `messageType` indicates that the handshake failed (`logui-handshake-failure`). A more specific `failureDetails` field is provided with two subfields. Refer to [later in this guide](#logui-handshake-failure) for more information on failure responses.

After this response has been sent to the client, the server will close the WebSocket.

### Event Listening

Event listening is the main stage in LogUI. Interactions that are requested to be logged are gathered by the LogUI client and then sent down the WebSocket connection to the LogUI server in batches. When the LogUI client is ready to send a batch of logged events, it does so with a `logui-event-payload` message.

An example of this message is shown below.

```json
{
    "messageType": "logui-event-payload",
    "events": [
        {
            "timestamp": "123456789",
            "eventName": "click"
        },
        {
            ...
        },
        {
            ...
        },
        ...
    ]
}
```

For this message, the type of the aforementioned `logui-event-payload`. The field `events` is an array of events. This array can be of variable length; it can be zero length, which denotes that no events are to be saved from this payload. Events are assumed by the LogUI server to be placed in chronological order (where the earliest event is placed first in the array).

As each `event` that is logged can vary wildly, the fields that are included in each `event` entry are very much open to whatever is required. However, the LogUI server will expect at the very least the following fields to be present for each event logged.

* `timestamp`, representing the UNIX timestamp (using the client's time) for when the event in question occurred.
* `eventName`, a string representing the name of the event.
* **TODO** - complete this list as required.

Application-specific data (as provided by `applicationSpecificData`) is bound to each event on the LogUI server before it is committed to data storage.

If any of the required fields listed above are missing, or some other formatting issue is present within the request, the request is counted as a [*bad request*. See a later section on this](#dealing-with-bad-requests).

If the request is successful, the server will respond with a simplistic message, as shown below.

```json
{
    "messageType": "logui-events-saved"
}
```

This `logui-events-saved` message is an indication that the request has been accepted, and that the events have been successfully stored. As such, the client no longer needs to retain these events in its memory.

### Updating Application-Specific Data

At any stage after a successful handshake, but before the WebSocket connection is closed, the LogUI client may request to change the `applicationSpecificData` that is held for the current session. When a change is requested, all events that are logged will from that point onwards will have the updated set of `applicationSpecificData` applied.

Why would one want to do this? One possible reason could be to capture a change in state within a particular session. If a user is undertaking an experiment for example, a change in `applicationSpecificData` could reflect the fact that they leave a phase providing instructions to a phase that requires them to perform some kind of activity. Providing a field in `applicationSpecificData` could make this easier to track.

As the LogUI client works by sending events to the LogUI server in batch, there may be events present that the client wishes to save with the old `applicationSpecificData` scheme, *before* applying an update. To counter this, this request considers two main payloads: the updated `applicationSpecificData` fields, and a `logui-event-payload`.

An example of this request is shown below.

```json
{
    "messageType": "logui-application-specific-data-change",
    "applicationSpecificDataChanges": {
        ...,
        "condition": "c3",
        "bonus": true,
        "askedForHelp": null
        ...
    },
    "saveEventsBefore": {
        "messageType": "logui-event-payload",
        "events": [
            {
                "timestamp": "123456789",
                "eventName": "click"
            },
            ...
        ]
    }
}
```

This request outlines that the application-specific fields `condition` must be set to `c3`, and `bonus` must be set to `true`. Using the `applicationSpecificData` definition [provided earlier in this guide](#complete-logui-handshake-example), we note that `condition` was already provided (with a value of `c2`). The effect of this latter `logui-application-specific-data-change` is that the value of `condition` is **changed** from `c2` to `c3`. As `bonus` did not exist, it is **created**. Where a field existed but should now be **deleted**, the value should be set to `null`, as shown in the example above for `askedForHelp`.

Setting a field's value to `null` that was not present in the application-specific data beforehand has no effect. If `applicationSpecificDataChanges` is empty, no changes to the application-specific data are made.

The LogUI client should also provide a `saveEventsBefore` field as part of the `logui-application-specific-data-change` request. The expected value for this field is an encapsulated `logui-event-payload` request, complete with `messageType`. [Refer to the appropriate section for more information on what is expected here](#event-listening). To clarify, the `events` array can be empty (i.e. zero-sized), but *it must always be present in the request.* **All events presented here are saved *before* the `applicationSpecificDataChanges` are applied.**

If a valid `logui-application-specific-data-change` request is made, the server will respond with a simplistic acknowledgement. This is to primarily serve notice to the LogUI client that any `events` have been successfully saved, and can be disposed of by the LogUI client.

```json
{
    "messageType": "logui-application-specific-data-saved"
}
```

If for any reason the request failed, a failure response is issued.

### WebSocket Disconnection

A WebSocket disconnect can occur on the server-side or the client-side. We take each scenario in turn. By far the most likely occurrence will be a client-side disconnection.

#### Client-Side Disconnection

Client-side disconnections can happen for four main reasons.

1. The user moves away from the page being logged by LogUI, causing the LogUI client library to be unloaded.
2. The code controlling the LogUI client programmatically instructs the LogUI client to stop.
3. The user's Internet connection is interrupted.
4. The user's browser and/or computer crashes.

Not much can be done to recover from the fourth reason. For the third reason, the process is [outlined in this section](#attempting-to-reconnect). However, for the first two reasons, the LogUI client needs to send to the LogUI server any events that it has saved before unloading.

In this eventuality, the LogUI client is expected to send the following request to the LogUI server.

```json
{
    "messageType": "logui-client-shutdown",
    "clientShutdownTimestamp": "641143800",
    "saveEvents": {
        "messageType": "logui-event-payload",
        "events": [
            {
                "timestamp": "123456789",
                "eventName": "click"
            },
            ...
        ]
    }
}
```

The `logui-client-shutdown` request includes a `saveEvents` field, which is itself an encapsulated `logui-event-payload` request. Zero or more `events` can be sent with this request. The `logui-client-shutdown` request also includes a `clientShutdownTimestamp` field, the value of which is the UNIX timestamp (from the client's clock) for the point at which the request is sent.

Upon the receipt of this request, the LogUI server will simply close the connection to the LogUI client. This is considered acknowledgement that the events have been successfully saved, and all loose ends on the LogUI server have been cleared up.

#### Server-Side Disconnection

WebSocket disconnections are initiated by the LogUI server when it is about to be shut down, or dies. Where possible, the LogUI server will send a message alerting any LogUI clients connected to it of the impending shutdown.

```json
{
    "messageType": "logui-server-shutdown-alert"
}
```

This simple message is then expected to be followed up by a response from the LogUI client. As the server is about to go down, all events that the LogUI client presently has stored need to be flushed to the server. The client should respond in a timely manner with the following request.

```json
{
    "messageType": "logui-server-shutdown-acknowledge",
    "clientShutdownTimestamp": "641143800",
    "saveEvents": {
        "messageType": "logui-event-payload",
        "events": [
            {
                "timestamp": "123456789",
                "eventName": "click"
            },
            ...
        ]
    }
}
```

This request contains a packaged version of a `logui-event-payload` request (via the `saveEvents` field), containing all of the events that the LogUI client requests to be saved. The request also includes a `clientShutdownTimestamp` field, which represents the UNIX timestamp (as per the client's clock) at the point when the request is sent. If the server is still active, the server will save the events, and respond with the following message.

```json
{
    "messageType": "logui-server-shutdown-saved"
}
```

After this has been received, the LogUI client should expect the LogUI server to close the WebSocket connection.

The `logui-server-shutdown-saved` message serves as confirmation to the LogUI client that the events that were passed were passed as part of the `logui-server-shutdown-acknowledge` request were successfully saved, and can be discarded by the LogUI client.

In the eventuality that the WebSocket connection is closed before receiving this acknowledgement message, the LogUI client **should not assume that the events have been saved.** They should be retained by the client as it attempts to reconnect to the LogUI server.

#### Attempting to Reconnect

If the WebSocket connection was lost (either through the server closing the connection, or through some connection loss), the LogUI client should then continue to log events, storing them client-side temporarily. While the user continues to interact with the page being logged, the LogUI client should attempt to reconnect to the LogUI server every 30 seconds.

If a WebSocket connection is re-established, the LogUI client should undertake the [handshake process](#logui-handshake) once more, taking care to include the `sessionUUID` field within the handshake to ensure continuity with the session being tracked. Immediately after a successful handshake, the LogUI client should send a `logui-event-payload` request to the LogUI server, flushing the buildup of logged events on the client. After this has been acknowledged by the LogUI server, normality can resume.

As mentioned, the LogUI client will continue to log events while the LogUI server is down. However, there is obviously a limit to how much can be stored in the client's memory. This will be measured by the LogUI client, and if a sensible limit is reached before reconnecting to the LogUI server, the LogUI client will have to shut down.

If reconnection to the LogUI server cannot be made before the user leaves the page that they are on, the saved event data is unfortunately lost as there is no way to save it.

*When the browser is closed, all context is lost. If the user closes their browser tab or window, capturing the data when offline becomes an impossible task.*

## Dealing with Bad Requests

If the LogUI client sends a request that the LogUI server does not understand, this is considered to be a **bad request**. A bad request can only occur in the **Event Listening** or **WebSocket Disconnection** stages of the LogUI protocol. If a bad request is sent during the LogUI Handshake stage, this is considered to be a `logui-handshake-failure`. Otherwise, the `messageType` will be a `logui-bad-request`.

Refer to the [following section](#logui-failure-responses) for the possible error messages that can be sent back to the LogUI client in the case of failure.

A total of five bad requests can be made before the server disconnects the LogUI client. After the fifth bad request is made, the LogUI server simply closes the WebSocket connection without any acknowledgement.

## LogUI Failure Responses

If a request sent to the LogUI server results in some kind of failure, the specific failure type is sent back via `messageType`, with details specific to the failure reported in the `errorDetails` field. This contains at least two subfields:

- `errorCode`, reporting a specific failure code (unique to the type of failure); and
- `terminateConnection`, a boolean indicating whether the failure is severe enough to warrant a closing of the WebSocket.

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

With this type of failure, the LogUI handshake was not successful. In all scenarios, the WebSocket connection will be terminated. Failure codes `100` through `109` are devoted to this failure type.

- **Code `100` (Generic)**
    A generic failure code for `logui-handshake-failure`. Not documented here.

- **Code `101` (Badly Formatted)**
    One or more fields missing from the handshake request.

- **Code `102` (Bad `applicationIdentifier` String)**
    An invalid `applicationIdentifier` string was supplied. Decryption failure.

- **Code `103` (Unknown Application or Flight ID)**
    An unknown `applicationID` or `flightID` were supplied. One did not match against the database.

- **Code `104` (Version Mismatch)**
    A mismatched version was supplied from the `applicationIdentifier` string. A version of the LogUI Client library is being used that does not match with what is expected.

- **Code `105` (Unsupported Client Version)**
    An unsupported LogUI client version is being used with the LogUI server endpoint.

### `logui-bad-request`

A bad request encompasses all eventualities after the handshake stage of the protocol. Failure codes `200` to `209` are devoted to this failure type.

- **Code `200` (Generic)**
    A generic failure code for requests that take place after the handshake stage. Not documented here.

- **Code `201` (`logui-event-payload` Badly Formed)**
    The `logui-event-payload` request is badly formed. Either bad JSON was supplied, or one or more required fields were missing.

- **Code `202` (`logui-event-payload` Missing Field)**
    One of the `logui-event-payload` event fields were missing. Ensure that the required fields are present for each field.

- **Code `203` (`logui-application-specific-data-change` Badly Formed)**
    The `logui-application-specific-data-change` request is badly formed. The request contained badly formed JSON, or was missing one or more required fields.

### `logui-server-failure`

A LogUI server failure will almost always entail that the WebSocket connection will be closed. Failure codes `300` to `309` are devoted to this failure type.

- **Code `300` (Generic)**
    A generic LogUI server failure code for events that are not captured by their own identifying failure code.
