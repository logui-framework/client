import Config from './modules/config';
import Dispatcher from '__dispatcherImport__';
import DOMHandler from './modules/DOMHandler/handler';
import EventPackager from './modules/eventPackager';
import MetadataHandler from './modules/metadataHandler';
import SpecificFrameworkEvents from './modules/specificFrameworkEvents';
import EventHandlerController from './modules/eventHandlerController';
import RecordRTCPromisesHandler from 'recordrtc';
import eventPackager from './modules/eventPackager';

export default (function(root) {
    var _public = {};

    /* Public build variables */
    _public.buildVersion = '__buildVersion__';
    _public.buildEnvironment = '__buildEnvironment__';
    _public.buildDate = '__buildDate__';

    _public.Config = Config;

    /* API calls */
    _public.init = async function(suppliedConfigObject) {
        root.addEventListener('logUIShutdownRequest', _public.stop);

        if (!suppliedConfigObject) {
            throw Error('LogUI requires a configuration object to be passed to the init() function.');
        }

        if (!Config.init(suppliedConfigObject)) {
            throw Error('The LogUI configuration component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!MetadataHandler.init()) {
            throw Error('The LogUI metadata handler component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!EventPackager.init()) {
            throw Error('The LogUI event packaging component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!SpecificFrameworkEvents.init()) {
            throw Error('The LogUI events component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!await Dispatcher.init(suppliedConfigObject)) {
            throw Error('The LogUI dispatcher component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!DOMHandler.init()) {
            throw Error('The LogUI DOMHandler component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!EventHandlerController.init()) {
            throw Error('The LogUI event handler controller component failed to initialise. Check console warnings to see what went wrong.');
        }
        
        root.addEventListener('unload', _public.stop);
    };

    _public.isActive = function() {
        return (
            Config.isActive() &&
            Dispatcher.isActive());
    }

    _public.stop = async function() {
        if (!_public.isActive()) {
            throw Error('LogUI may only be stopped if it is currently running.');
        }

        root.removeEventListener('unload', _public.stop);
        root.removeEventListener('logUIShutdownRequest', _public.stop);

        // https://stackoverflow.com/questions/42304996/javascript-using-promises-on-websocket
        DOMHandler.stop();
        EventHandlerController.stop();
        SpecificFrameworkEvents.stop();
        EventPackager.stop();
        MetadataHandler.stop();
        await Dispatcher.stop();
        Config.reset();
        root.dispatchEvent(new Event('logUIStopped'));
    };

    _public.logCustomMessage = function(messageObject) {
        if (!_public.isActive()) {
            throw Error('Custom messages may only be logged when the LogUI client is active.');
        }
        
        EventPackager.packageCustomEvent(messageObject);
    };

    _public.updateApplicationSpecificData = function(updatedObject) {
        if (!_public.isActive()) {
            throw Error('Application specific data can only be updated when the LogUI client is active.');
        }

        Config.applicationSpecificData.update(updatedObject);
        SpecificFrameworkEvents.logUIUpdatedApplicationSpecificData();
    };

    _public.deleteApplicationSpecificDataKey = function(key) {
        Config.applicationSpecificData.deleteKey(key);
        SpecificFrameworkEvents.logUIUpdatedApplicationSpecificData();
    }

    _public.clearSessionID = function() {
        if (_public.isActive()) {
            throw Error('The session ID can only be reset when the LogUI client is inactive.');
        }

        Config.sessionData.clearSessionIDKey();
    };

    // const start = document.getElementById("start");
    // const stop = document.getElementById("stop");
    // const video = document.querySelector("video");
    let recorder, stream;
    let startTime;
    var displayMediaOptions = {
        video: {
          aspectRatio: 1920/1080,
          frameRate: 60,
          cursor: "always"
          
        },
        audio: false
      };

    async function startRecording() {
        stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        // recorder = new MediaRecorder(stream);
        recorder = new RecordRTCPromisesHandler(stream, {
            type: 'video',
            timeSlice: 5000,
            mimeType: 'video/webm;',
            ondataavailable: async function(blob) {
                Dispatcher.sendObject(blob);
                var timeSinceStart = (new Date()).getTime() - startTime;
                let timeSinceStartMS = timeSinceStart;
                var secs = Math.floor(timeSinceStart/1000);
                var mins = Math.floor(secs/60);
                var hrs = Math.floor(mins/60);
                timeSinceStart = timeSinceStart - secs*1000;
                secs = secs - mins*60;
                mins = mins - hrs*60;
                // console.log("Time since start recording: " + hrs + ":" + mins +":" + secs +":" + timeSinceStart);
                let timeString = hrs + ":" + mins +":" + secs +"." + timeSinceStart;

                let eventDetails = {
                    timeSinceStartRecording: {
                        milliSeconds: timeSinceStartMS,
                        formatted: timeString
                    }
                };

                eventPackager.packageScreenCaptureEvent(eventDetails);
        

            }
          });

        recorder.startRecording();  
        startTime = (new Date()).getTime(); 
    }


    _public.startScreenCapture = function() {
        startRecording();
    }

    _public.stopScreenCapture = async function() {
        await recorder.stopRecording();
        stream.getVideoTracks()[0].stop();
    }

    // start.addEventListener("click", () => {
    //     start.setAttribute("disabled", true);
    //     stop.removeAttribute("disabled");

    //     startRecording();
    // });

    // stop.addEventListener("click", () => {
    //     stop.setAttribute("disabled", true);
    //     start.removeAttribute("disabled");

    //     recorder.stop();
    //     stream.getVideoTracks()[0].stop();
    // });

    return _public;
})(window);