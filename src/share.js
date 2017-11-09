var Promise = require('promise-polyfill');
var device = require('./device');
var logModule = require('./log');


/**
 * SHARE Module
 * 
 * https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin
 * 
 */

var share = (
    function(){

        
        var shareProtected = {};
        
        var getOptions = function(requestedOptions) {
            var availableOptions = ['message', 'subject', 'files', 'chooserTitle'];
            var options = {
                url: requestedOptions.url
            };
            availableOptions.forEach(function(availableOption) {
                if (availableOption in requestedOptions) {
                    options[availableOption] = requestedOptions[availableOption];
                }
            });
            return options;
        };

        var getSocialPackage = function(social) {
            if (device.isRunningOnIos()) {
                if (social === 'facebook') {
                    return 'com.apple.social.facebook';
                }
                if (social === 'twitter') {
                    return 'com.apple.social.twitter';
                }
            }

            return social;
        };
        
        var shareWithChooser = function(requestedOptions, resolve, reject) {
            // this is the complete list of currently supported params you can pass to the plugin (all optional)
            // var fullOptions = {
            //    message: 'share this', // not supported on some apps (Facebook, Instagram)
            //    subject: 'the subject', // fi. for email
            //    files: ['', ''], // an array of filenames either locally or remotely
            //    url: 'https://www.website.com/foo/#bar?a=b',
            //    chooserTitle: 'Pick an app' // Android only, you can override the default share sheet title
            // };
            
            var options = getOptions(requestedOptions);
            
            var onSuccess = function(result) {
                logModule.log('[share] Share completed? ' + result.completed); // On Android apps mostly return false even while it's true
                logModule.log('[share] Shared to app: ' + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
                
                resolve(result);
            };

            var onError = function(msg) {
                logModule.err('[share] Sharing failed with message: ' + msg);
                
                reject(msg);
            };

            window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
        };
        
        var shareWithFacebook = function(requestedOptions, resolve, reject) {
            var onSuccess = function(result) {
                logModule.log('[share] Facebook share completed, result: ', result);
                resolve(result);
            };

            var onError = function(msg) {
                logModule.err('[share] Facebook sharing failed with message: ' + msg);
                reject(msg);
            };
            
            window.plugins.socialsharing.shareViaFacebook(
                '',
                null,
                requestedOptions.url,
                onSuccess,
                onError
            );
        };
        
        var shareWithTwitter = function(requestedOptions, resolve, reject) {
            var onSuccess = function(result) {
                logModule.log('[share] Twitter share completed, result: ', result);
                resolve(result);
            };

            var onError = function(msg) {
                logModule.err('[share] Twitter sharing failed with message: ' + msg);
                reject(msg);
            };
            
            var message = '';
            if ('message' in requestedOptions) {
                message = requestedOptions.message;
            }
            window.plugins.socialsharing.shareViaTwitter(
                message,
                null,
                requestedOptions.url,
                onSuccess,
                onError
            );
        };
        var shareWithWhatsapp = function(requestedOptions, resolve, reject) {
            var onSuccess = function(result) {
                logModule.log('[share] Whatsapp share completed, result: ', result);
                resolve(result);
            };

            var onError = function(msg) {
                logModule.err('[share] Whatsapp sharing failed with message: ' + msg);
                reject(msg);
            };
            
            var message = '';
            if ('message' in requestedOptions) {
                message = requestedOptions.message;
            }
            
            window.plugins.socialsharing.shareViaWhatsApp(
                message,
                null,
                requestedOptions.url,
                onSuccess,
                onError
            );
        };
        
        shareProtected.canShareVia = function(via, url) {
            
            var viaNative = getSocialPackage(via);

            return new Promise(function(resolve){
                
                // canShareVia: 
                //   via, message, subject, fileOrFileArray, url, successCallback, errorCallback
                window.plugins.socialsharing.canShareVia(
                    viaNative,
                    null,
                    null,
                    null,
                    url,
                    function(e){
                        logModule.log('[share] canShareVia ' + via + ' (' + viaNative + ') result true: ', e);
                        resolve({
                            network: via,
                            available: true
                        });
                    },
                    function(e){
                        logModule.log('[share] canShareVia ' + via + ' (' + viaNative + ') result false: ', e);
                        resolve({
                            network: via,
                            available: false
                        });
                    }
                );
            });
        };
        
        
        shareProtected.socialShare = function(options, resolve, reject) {
            
            if (typeof options !== 'object') {
                options = {};
                logModule.war('[share] parameter options must be object!');
            }
            
            if (!options.type) {
                options.type = 'chooser';
            }

            if (!window.plugins || !window.plugins.socialsharing) {

                // plugin is not installed
                logModule.err('[share] missing cordova plugin');
                return reject('missing cordova plugin');
            }
            
            if (!options.url) {
                logModule.err('[share] missing parameter url');
                return reject('missing parameter url');
            }
            
            logModule.log('[share] Sharing url: ' + options.url + ' on: ' + options.type, options);
            
            if (options.type === 'chooser') {
                return shareWithChooser(options, resolve, reject);
            }
            
            if (options.type === 'facebook') {
                return shareWithFacebook(options, resolve, reject);
            }
            
            if (options.type === 'twitter') {
                return shareWithTwitter(options, resolve, reject);
            }
            
            if (options.type === 'whatsapp') {
                return shareWithWhatsapp(options, resolve, reject);
            }

            logModule.err('[share] type not valid');        
            return reject('type not valid');
            
        };
        
        return shareProtected;
    }()
);

/**
 * @name initialize
 * @memberof Share
 *
 * @description initialize share module
 *
 */
module.exports.initialize = function() {
    
    return Promise.resolve();
};

/**
 * @name name
 * @memberof Share
 *
 * @description module name
 *
 */
module.exports.name = function() {
    return 'share';
};

/**
 * @name socialShare
 * @memberof Share
 *
 * @description share an url on a social network
 *
 * @param {object} options
 */
module.exports.socialShare = function(options) {
    
    var result = new Promise(function(resolve, reject){
        
        share.socialShare(options, resolve, reject);
    });
    
    
    return result;
};

/**
 * @name socialShareAvailable
 * @memberof Share
 *
 * @description return a promise with an array of available social networks
 *
 * @param {object} options
 * @param {Array} options.socials - list of social network to check
 * 
 */
module.exports.socialShareAvailable = function(options) {
    
    if (!window.plugins || !window.plugins.socialsharing) {
        // plugin is not installed
        logModule.err('[share] missing cordova plugin');
        return Promise.reject('missing cordova plugin');
    }
    
    if (!options.socials || typeof options.socials !== 'object') {
        logModule.err('[share] missing object parameter socials');
        return Promise.reject('missing object parameter socials');
    }
    
    if (!options.url) {
        logModule.err('[share] missing parameter url');
        return Promise.reject('missing parameter url');
    }
    
    
    var result = new Promise(function(resolve, reject){
        
        var socialsAvailabilityPromises = [];
    
        var knownSocialNetworks = [
            'facebook',
            'whatsapp',
            'twitter',
            'instagram'
        ];
        knownSocialNetworks.forEach(function(element) {
            // check only requested networks
            
            if (options.socials[element]) {
                
                socialsAvailabilityPromises.push(
                    
                    share.canShareVia(element, options.url)
                );
                
            }
        });
        
        Promise.all(socialsAvailabilityPromises).then(function(values) { 
            
            var availableNetworks = {};
            // values is like:
            //  [{'network': 'facebook', 'available': false},
            //   {'network': 'twitter', 'available': false}]
            values.forEach(function(element) {
                availableNetworks[element.network] = element.available;
                // logModule.log('element: ', element);
            });
            // logModule.log('values: ', values);
            // logModule.log('availableNetworks: ', availableNetworks);
            resolve(availableNetworks);
            
        }, function(reason) {
            
            logModule.err(reason);
            reject(reason);
        });
    });
    
    
    return result;
};

