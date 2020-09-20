import Defaults from './modules/defaults';
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
    _public.init = function(suppliedConfigObject) {
        if (!root.LogUI.Config.init(suppliedConfigObject)) {
            throw Error('The LogUI configuration component failed to initialise. Check console warnings for output to see what went wrong.');
        }

        if (!root.LogUI.Dispatcher.init(suppliedConfigObject)) {
            throw Error('The LogUI dispatcher component failed to initialise. Check console warnings for output to see what went wrong.');
        }

        // Bind aliases for DOM query selectors AFTE the initialisation.
        // Initialisation confirms that the browser supports them!
        _public.$ = root.document.querySelector.bind(root.document);
        _public.$$ = root.document.querySelectorAll.bind(root.document);
    };

    _public.stop = function() {
        console.log('request to stop logUI');
    };

    _public.updateApplicationSpecificData = function(appSpecificObject) {

    };

    _public.clearSessionData = function() {
        Config.clearSessionUUID();
    };

    return _public;
})(window);