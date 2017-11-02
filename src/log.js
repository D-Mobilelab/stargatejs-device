/**
 * when isStaging is true we log with parameters, 
 * when is false we log with only one parameter
 *   because cordova.console on android doesn't support more than 
 *   one paramenter and in release version we only can see console
 *   logs with cordova console plugin.
 */ 
var isStaging = 0;


var argsToString = function() {
    var args = Array.prototype.slice.call(arguments);
    var result = '';
    for (var i = 0; i < args.length; i++) {
        if (typeof (args[i]) === 'object') {
            result += ' ' + JSON.stringify(args[i]);
        } else {
            result += ' ' + args[i];
        }
    }
    return result;
};

// logger function
var log = window.console.log.bind(window.console, '[Stargate] ');
var err = window.console.error.bind(window.console, '[Stargate] ');
var war = window.console.warn.bind(window.console, '[Stargate] ');
if (!isStaging) {
    log = function(){
        console.log('[I] [Stargate] ' + argsToString.apply(null, arguments));
    };
    err = function(){
        console.log('[E] [Stargate] ' + argsToString.apply(null, arguments));
    };
    war = function(){
        console.log('[W] [Stargate] ' + argsToString.apply(null, arguments));
    };
}

module.exports = {
    log: log,
    err: err,
    war: war
};