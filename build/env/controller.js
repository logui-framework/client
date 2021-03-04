var LogUITestEnvDriver = (function(root) {
    var _public = {};
    var initTimestamp = null;
    var detectReference = null;
    
    _public.$ = root.document.querySelector.bind(root.document);
    _public.$$ = root.document.querySelectorAll.bind(root.document);

    const CONSOLE_LIST_ELEMENT = _public.$('#console-list');

    const STATUS_MESSAGES = {
        'unloaded': 'LogUI unloaded',
        'inactive': 'LogUI loaded; inactive',
        'starting': 'LogUI loaded; starting...',
        'stopping': 'LogUI loaded; stopping...',
        'active': 'LogUI loaded; active'
    }

    _public.init = function() {
        initTimestamp = new Date();
        _public.clearConsole();
        _public.addEnvMessage('Initialising test environment');
        _public.addEnvMessage('Messages with a blue background (like this) are from the test environment.');
        setStatus('unloaded');
        
        detectReference = window.setInterval(detectLogUI, 500);
        bindButtonListeners();
    };

    _public.addEnvMessage = function(msg) {
        let newNode = document.createElement('li');
        let textNode = document.createTextNode(msg);
        newNode.appendChild(textNode);
        newNode.classList.add('env');

        CONSOLE_LIST_ELEMENT.insertBefore(newNode, CONSOLE_LIST_ELEMENT.firstChild);
    };

    _public.clearConsole = function() {
        CONSOLE_LIST_ELEMENT.innerHTML = '';
    };

    function bindButtonListeners() {
        _public.$('#control-clear').addEventListener('click', function() {
            _public.clearConsole();
        });

        _public.$('#control-start').addEventListener('click', function() {
            _public.addEnvMessage('Starting LogUI');
            setStatus('starting');
            _public.$('#control-start').disabled = true;

            window.LogUI.init(window.config)
                .catch(error => {throw Error(error)});
        });

        _public.$('#control-stop').addEventListener('click', function() {
            _public.addEnvMessage('Stopping LogUI');
            setStatus('stopping');

            _public.$('#control-stop').disabled = true;

            window.LogUI.stop().then(function(resolved) {
                _public.$('#control-start').disabled = false;
                setStatus('inactive');
            });
        });

        root.addEventListener('logUIStarted', function() {
            if (window.LogUI.isActive()) {
                _public.$('#control-stop').disabled = false;
                setStatus('active');
                _public.addEnvMessage('LogUI started; listening for events');
            }
        });

        // This listener is bound to demonstrate its functionality.
        // We could equally put this code in the .stop().then() call above.
        root.addEventListener('logUIStopped', function() {
            _public.addEnvMessage('LogUI stopped');
        });
    };

    function setStatus(statusKey) {
        _public.$('#control-status').innerText = STATUS_MESSAGES[statusKey];

        if (statusKey == 'inactive') {
            _public.$('#control-version').style.display = 'inline';
            _public.$('#control-version').innerText = `Version ${LogUI.buildVersion}`;
        }
    };

    function detectLogUI() {
        if (window.LogUI) {
            window.clearInterval(detectReference);
            setStatus('inactive');
            _public.$('#control-start').disabled = false;
        }
    };
    
    return _public;
})(window);

document.addEventListener('DOMContentLoaded', function() {
    LogUITestEnvDriver.init();

    LogUITestEnvDriver.$('#test-dommanipulation-button').addEventListener('click', function() {
        if (this.innerHTML.includes('add')) {
            var element1 = document.createElement('div');
            element1.appendChild(document.createTextNode('No binding'))
            element1.id = 'test-dommanipulation-box1';
            element1.classList.add('test');
    
            var element2 = document.createElement('div');
            element2.appendChild(document.createTextNode('Hover and click binding'))
            element2.id = 'test-dommanipulation-box2';
            element2.classList.add('test');
    
            LogUITestEnvDriver.$('#test-dommanipulation-newcontainer').appendChild(element1);
            LogUITestEnvDriver.$('#test-dommanipulation-newcontainer').appendChild(element2);
            
            this.innerHTML = 'Click to destroy elements';

            return;
        }

        this.innerHTML = 'Click to add two new elements';
        LogUITestEnvDriver.$('#test-dommanipulation-newcontainer').innerHTML = '';
    });
});