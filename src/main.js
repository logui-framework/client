import Defaults from './defaults';
import Config from './modules/config';
import Helpers from './modules/helpers';
import Dispatcher from '__dispatcherImport__';

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

    /* API calls */
    _public.init = function(configObj) {
        if (!root.LogUI.Config.init(configObj)) {
            throw Error('The LogUI configuration component failed to initialise. Check the console for output to see what went wrong.');
        }

        if (!root.LogUI.Dispatcher.init(configObj)) {
            throw Error('The LogUI dispatcher component failed to initialise. Check the console for output to see what went wrong.');
        }
    };

    _public.stop = function() {
        console.log('request to stop logUI');
    };

    _public.updateApplicationSpecificData = function(appSpecificObject) {

    };

    _public.flushSessionData = function() {
        console.log("Flush session data; remove UUID");
        // This should work by deleting any UUID from session storage.
        // This should work without any instantiation required.
    };

    return _public;
})(window);