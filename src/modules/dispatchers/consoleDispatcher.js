/*
    LogUI Client Library
    Page-based Dispatcher

    A dispatcher object that outputs elements to a "console" element on a page.
    No network or server activity involved.

    @module: Page-based Dispatcher
    @author: David Maxwell
    @date: 2020-09-20
*/

import Config from '../config';
import Binder from '../binder';
import Helpers from '../helpers'
import Defaults from '../defaults';
import RequiredFeatures from '../required';
import ValidationSchemas from '../validationSchemas';

Defaults.dispatcher = {
    consoleElement: null,  // The element that the console is rendered in.
}

RequiredFeatures.addFeature('document.createElement');
RequiredFeatures.addFeature('document.createTextNode');

ValidationSchemas.addLogUIConfigProperty('consoleElement', 'string');

export default (function(root) {
    var _public = {};
    _public.dispatcherType = 'console';
    var consoleElement = null;

    _public.init = function() {
        return (
            doesConsoleElementExist()
        );
    };

    _public.sendObject = function(objToSend) {
        createElement();
    };

    _public.stop = function() {
        return new Promise(resolve => {
            setTimeout(() => { resolve()}, 2000);
        });
    };

    function doesConsoleElementExist() {
        let consoleElementString = Config.getConfigProperty('consoleElement');
        consoleElement = Binder.$(consoleElementString);

        if (!consoleElement) {
            Helpers.console(`The dispatcher cannot find the specified console element (${consoleElementString}) in the DOM.`, 'Initialisation', true);
            return false;
        }

        return true;
    }

    function createElement() {
        let newNode = document.createElement('li');
        let textNode = document.createTextNode('some text from LogUI');

        newNode.appendChild(textNode);
        consoleElement.insertBefore(newNode, consoleElement.firstChild);

        return newNode;
    }

    return _public;
})(window);