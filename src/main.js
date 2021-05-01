import Config from './modules/config';
import Dispatcher from '__dispatcherImport__';
import DOMHandler from './modules/DOMHandler/handler';
import EventPackager from './modules/eventPackager';
import MetadataHandler from './modules/metadataHandler';
import SpecificFrameworkEvents from './modules/specificFrameworkEvents';
import EventHandlerController from './modules/eventHandlerController';

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
    var displayMediaOptions = {
        video: {
          aspectRatio: 1920/1080,
          frameRate: 10,
          cursor: "always"
          
        },
        audio: false
      };

    async function startRecording() {
        stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
        recorder = new MediaRecorder(stream);

        const chunks = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = e => {
            const completeBlob = new Blob(chunks, { type: chunks[0].type });
            // video.src = URL.createObjectURL(completeBlob);
            // EventPackager.packageScreenCaptureEvent(URL.createObjectURL(completeBlob));
            // const b64 = await blobToBase64(completeBlob);
            // const jsonString = JSON.stringify({completeBlob: b64});
            // EventPackager.packageScreenCaptureEvent(convertBlob(completeBlob));

            var reader = new FileReader();
            reader.readAsDataURL(completeBlob); 
            reader.onloadend = function() {
                var base64data = reader.result;                
                console.log(base64data);
                EventPackager.packageScreenCaptureEvent(base64data);

            }
        };

        recorder.start();   
    }

    // const blobToBase64 = (blob) => {
    //     return new Promise((resolve) => {
    //       const reader = new FileReader();
    //       reader.readAsDataURL(blob);
    //       reader.onloadend = function () {
    //         resolve(reader.result);
    //       };
    //     });
    //   };
      
    //   async function convertBlob(blob) {
    //     const b64 = await blobToBase64(blob);
    //     const jsonString = JSON.stringify({blob: b64});
    //     return jsonString;
    //   }

    _public.startScreenCapture = function() {
        startRecording();
    }

    _public.stopScreenCapture = function() {
        recorder.stop();
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