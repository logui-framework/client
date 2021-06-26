# LogUI Client <a href="https://www.tudelft.nl"><img align="right" width="100" src="./.meta/tudelft.svg" /></a>

**Welcome to this LogUI expansion!** 
This is an expansion of the [LogUI client library](https://github.com/logui-framework/client) This expansion adds screen capture functionality features to *LogUI*. 

  

Use the LogUI client in tandem with the LogUI server. You can find the LogUI server expansion living at [this repository](https://github.com/hjpvandijk/server).
  

## About this expansion

This expansion of the LogUI library is implemented by [Hugo van Dijk](https://github.com/hjpvandijk), a student at [TUDelft](https://www.tudelft.nl/) in the Netherlands. 


  

## Documentation and Quick Start Guide
For documentation on LogUI client library, please go and check out the [corresponding Wiki](https://github.com/logui-framework/client/wiki/) associated with the original LogUI client repository. There, you'll find detailed information about how to [acquire yourself a copy](https://github.com/logui-framework/client/wiki/Acquiring), how to [set the client library up](https://github.com/logui-framework/client/wiki/Quick-Start-Guide), how to integrate it with your existing application's code, and information which should allow you to gain a better understanding as to the thinking behind the library's implementation.

### Starting screen capturing
Some browsers, like Mozilla Firefox, only allow screen recording when it is initiated by a user gesture handler, like a button click. So, the method ` window.LogUI.startScreenCapture()` should be called when a user clicks on a button, for example. When this method  is called, the user is prompted to select what area to share. After this has been selected, screen recording will start.

 ## Recording settings
 The [RecordRTC](https://recordrtc.org/) is used for recording the screen. By default the recordings are recorded with in 5 second intervals, and it will select the first codec supported by the browser in the order of: H.264, VP9, VP8. Bitrate is left up to the RecordRTC library, what presumably results in variable bitrate throughout the recording. 
 
 Recording settings can be changed in the [main.js](https://github.com/hjpvandijk/client/blob/screen-capture/src/main.js) file. Here, you can set the recorder's parameters, like MIME type, timeSlice (recording interval), and bitrate. 