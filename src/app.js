var Promise = require('promise-polyfill');
var packageJson = require('../package.json');

/**
 * APP Module
 * 
 * Needed cordova plugins:
 * 
 * 1. https://github.com/whiteoctober/cordova-plugin-app-version
 * 2. https://github.com/apache/cordova-plugin-device
 * 3. https://github.com/apache/cordova-plugin-network-information
 * 4. https://github.com/apache/cordova-plugin-inappbrowser
 * 
*/


function getCookieManager(w) {
    w = w || window;
    /**
    * @ngdoc function
    * @name getCookie
    * @methodOf app
    * @private
    *
    * @description return value of requested cookie
    * @param {String} cookie name
    *
    * @return {String} cookie value
    */
    return function(name) {
        var dc = w.document.cookie;
        console.log('cookie: ' + dc);
        var prefix = name + '=';
        var begin = dc.indexOf('; ' + prefix);
        var end = '';
        if (begin === -1) {
            begin = dc.indexOf(prefix);
            if (begin !== 0) {
                return null;            
            }
        } else {
            end = dc.indexOf(';', begin);
            begin += 2;
            if (end === -1) {
                end = dc.length;
            }
        }
        return decodeURI(dc.substring(begin + prefix.length, end));
    };
}

var protectedInterface = {};

var appInformation = {
    cordova: '',
    manufacturer: '',
    model: '',
    platform: '',
    deviceId: '',
    version: '',
    packageVersion: '',
    packageName: '',
    packageBuild: '',
    stargate: '',
    features: '',
    stargateModules: [],
    stargateError: '',
    connectionType: ''
};

var initPromise;

protectedInterface.initialize = function() {
    if (typeof window.cordova.getAppVersion === 'undefined') {
        return Promise.reject('[app] missing cordova plugin cordova-plugin-app-version!');
    }
    if (typeof window.navigator.connection === 'undefined') {
        return Promise.reject('[app] missing cordova plugin cordova-plugin-network-information!');
    }
    if (typeof window.device === 'undefined') {
        return Promise.reject('[app] missing cordova plugin cordova-plugin-device!');
    }

    if (initPromise) {
        return initPromise;
    }

    initPromise = Promise.all([
        window.cordova.getAppVersion.getPackageName,
        window.cordova.getAppVersion.getVersionCode,
        window.cordova.getAppVersion.getVersionNumber
    ])
    .then(function(results) {
        // 
        var packageName = results[0];
        var versionCode = results[1];
        var versionNumber = results[2];

        appInformation = {
            cordova: window.device.cordova,
            manufacturer: window.device.manufacturer,
            model: window.device.model,
            platform: window.device.platform,
            deviceId: window.device.uuid,
            version: window.device.version,
            packageVersion: versionNumber,
            packageName: packageName,
            packageBuild: versionCode,
            stargate: packageJson.version,
            features: '',
            stargateModules: [],
            stargateError: '',
            connectionType: window.navigator.connection.type
        };

        return appInformation;
    });

    return initPromise;
};

/**
* @ngdoc function
* @name isHybrid
* @methodOf app
*
* @description hybrid status
*
* @return {Boolean} true when running as native app
*/
module.exports.isHybrid = function(w) {
    w = w || window;
    var protocol = w.location.protocol;
    var search = w.location.search;
    
    if (protocol === 'file' || protocol === 'cdvfile') {
        return true;
    }

    if (/[?&]hybrid=/.test(search)) {
        return true;        
    }

    if (getCookieManager(w)('hybrid')) {
        return true;
    }
    
    return false;
};

/**
* @ngdoc function
* @name getDeviceID
* @methodOf app
*
* @description getDeviceID
* @return {Promise} promise resolved with {String} the device id
*
*/
module.exports.getDeviceID = function() {
    return protectedInterface.initialize()
    .then(function(appInfo) {
        return appInfo.deviceId;
    });
};


/**
* @ngdoc function
* @name getVersion
* @methodOf app
*
* @description getVersion
* @return {Promise} promise resolved with {String} StargateVersion
*
*/
module.exports.getVersion = function() {
    return protectedInterface.initialize()
    .then(function(appInfo) {
        return appInfo.stargate;
    });
};
    

/**
 * 
 * @ngdoc function
 * @name getInformation
 * @methodOf app
 *
 * @description getInformation
 *
 * @return {Promise} promise resolved with an object with these keys:
 *   cordova - Cordova version
 *   manufacturer - device manufacter
 *   model - device model
 *   platform - platform (Android, iOs, etc)
 *   deviceId - device UUID
 *   version - platform version
 *   packageVersion - package version
 *   packageName - package name ie: com.stargatejs.test
 *   packageBuild - package build number
 *   stargate - stargate version
 *   stargateModules - modules initialized
 *   stargateError - initialization error
 *   connectionType - connection type
 */
module.exports.getInformation = function() {
    return protectedInterface.initialize()
    .then(function(appInfo) {
        return appInfo;
    });
};


/**
* @ngdoc function
* @name openUrl
* @methodOf app
*
* @description openUrl
* @param {String} url to open
* @return {Promise} promise 
*
*/
module.exports.openUrl = function(url) {
    if (typeof window.cordova.InAppBrowser === 'undefined') {
        return Promise.reject('[app] missing cordova plugin cordova-plugin-inappbrowser!');
    }

    window.cordova.InAppBrowser.open(url, '_system');
    return Promise.resolve(true);
};