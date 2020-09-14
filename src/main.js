import Events from './modules/events';

export default (function(root) {
    var _public = {};
    var _timestamp = null;

    _public.version = '__buildVersion__';

    _public.mainFn = function() {
        return true;
    }

    _public.Events = Events;

    return _public;
})(window);