import Config from './modules/config';
import DOMHandler from './modules/DOMHandler/handler';
import EventPackager from './modules/eventPackager';
import Helpers from './modules/helpers';
import Dispatcher from '__dispatcherImport__';
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
        if (!suppliedConfigObject) {
            throw Error('LogUI requires a configuration object to be passed to the init() function.');
        }

        if (!Config.init(suppliedConfigObject)) {
            throw Error('The LogUI configuration component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!EventPackager.init()) {
            throw Error('The LogUI event packaging component failed to initialise. Check console warnings to see what went wrong.');
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
        
        root.dispatchEvent(new Event('logUIStarted'));
    };

    _public.isActive = function() {
        return (
            Config.isActive() &&
            Dispatcher.isActive());
    }

    _public.stop = async function() {
        // https://stackoverflow.com/questions/42304996/javascript-using-promises-on-websocket
        DOMHandler.stop();
        await Dispatcher.stop();
        Config.reset();
        EventPackager.stop();
        EventHandlerController.stop();
        root.dispatchEvent(new Event('logUIStopped'));
    };

    _public.logCustomMessage = function(message) {

    };

    _public.updateApplicationSpecificData = function(appSpecificObject) {

    };

    _public.clearSessionData = function() {
        Config.clearSessionUUID();
    };

    return _public;
})(window);