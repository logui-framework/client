export default (function() {
    var _public = {};
    var requiredFeatures = [
        'console',
        'document',
        'document.documentElement',
        'document.querySelector',
        'document.querySelectorAll',
        'navigator',
        'addEventListener',
        'sessionStorage',
        'MutationObserver',
        'WeakMap',
        'Object',
    ];

    _public.getFeatures = function() {
        return requiredFeatures;
    }

    _public.addFeature = function(feature) {
        requiredFeatures.push(feature);
    }

    return _public;
})();