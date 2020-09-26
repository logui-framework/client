import Config from './modules/config';
import Binder from './modules/binder';
import Helpers from './modules/helpers';
import Dispatcher from '__dispatcherImport__';
import EventHandlers from './modules/eventHandlers';

export default (function(root) {
    var _public = {};

    /* Public build variables */
    _public.buildVersion = '__buildVersion__';
    _public.buildEnvironment = '__buildEnvironment__';
    _public.buildDate = '__buildDate__';

    /* Including additional IIFE modules */
    _public.Helpers = Helpers;
    _public.Config = Config;
    _public.Dispatcher = Dispatcher;
    _public.Binder = Binder;
    _public.EventHandlers = EventHandlers;

    /* API calls */
    _public.init = async function(suppliedConfigObject) {
        if (!suppliedConfigObject) {
            throw Error('LogUI requires a configuration object to be passed to the init() function.');
        }

        if (!Config.init(suppliedConfigObject)) {
            throw Error('The LogUI configuration component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!await Dispatcher.init(suppliedConfigObject)) {
            throw Error('The LogUI dispatcher component failed to initialise. Check console warnings to see what went wrong.');
        }

        if (!Binder.init(suppliedConfigObject)) {
            throw Error('The LogUI binder component failed to initialise. Check console warnings to see what went wrong.');
        }
        
        root.dispatchEvent(new Event('loguistarted'));
    };

    _public.isActive = function() {
        return (
            Config.isActive() &&
            Dispatcher.isActive());
    }

    _public.stop = async function() {
        // https://stackoverflow.com/questions/42304996/javascript-using-promises-on-websocket
        Binder.unbind();  // Unbind the dispatcher first to stop any extra events being saved.
        await Dispatcher.stop();
        Config.reset();
        root.dispatchEvent(new Event('loguistopped'));
    };

    _public.updateApplicationSpecificData = function(appSpecificObject) {

    };

    _public.clearSessionData = function() {
        Config.clearSessionUUID();
    };

    return _public;
})(window);