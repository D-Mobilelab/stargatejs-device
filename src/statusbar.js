var Promise = require('promise-polyfill');
var device = require('./device');
var logModule = require('./log');

module.exports.initialize = function(initializeConf) {
    if (typeof window.StatusBar === 'undefined') {
        // missing cordova plugin
        return Promise.reject('[StatusBar] missing cordova plugin');
    }
    
    
    if (!initializeConf ||
        initializeConf.constructor !== Object ||
        Object.keys(initializeConf).length === 0) {
            
        return Promise.reject('[StatusBar] invalid configuration');
    }
    
    
    if (initializeConf.color) {
        // logModule.log('color: '+initializeConf.color);
        window.StatusBar.backgroundColorByHexString(initializeConf.color);
    }

    return Promise.resolve();
};

module.exports.setVisibility = function(visibility) {
    if (typeof window.StatusBar === 'undefined') {
        // missing cordova plugin
        return Promise.reject('[StatusBar] missing cordova plugin');
    }

    if (visibility) {
        window.StatusBar.show();
        return Promise.resolve('statusbar shown');
    }

    window.StatusBar.hide();
    return Promise.resolve('statusbar hided');
};
