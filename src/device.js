var axios = require('axios');
var Promise = require('promise-polyfill');

var File = require('./file');
var logModule = require('./log');

var Device = {};

var dictionaryFileName = 'dict.json';
var configFileName = 'config.json';
var statusFileName = 'status.json';
var dictionariApi = '/v01/dictionary.getlist';

Device.isRunningOnAndroid = function() {
    return window.device.platform === 'Android';
};
Device.isRunningOnIos = function() {
    return window.device.platform === 'iOS';
};
Device.applicationStorage = function() {
    var base = window.cordova.file.applicationStorageDirectory;
    if (window.device.platform.toLowerCase() === 'ios') {
        base += 'Documents/';
    }
    return base;
};

Device.setDictionary = function(options) {
    if (!options.saveDictionaryCb || typeof options.saveDictionaryCb !== 'function') {
        return Promise.reject(new Error('Parameters error, missing saveDictionaryCb'));
    }

    return File.readFileAsJSON(Device.applicationStorage() + dictionaryFileName)
    .then(function(jsonContents) {
        var cb = options.saveDictionaryCb;
        cb(jsonContents);
        logModule.log('[HybridDevice] Dictionary file loaded.');
    })
    .catch(function(error){
        logModule.log('[HybridDevice] Dictionary file not found: ', error);
    });
};

Device.setConfig = function(options) {
    if (!options.saveConfigCb || typeof options.saveConfigCb !== 'function') {
        return Promise.reject(new Error('Parameters error, missing saveConfigCb'));
    }
    
    return File.readFileAsJSON(Device.applicationStorage() + configFileName)
    .then(function(jsonContents) {
        var cb = options.saveConfigCb;
        cb(jsonContents);
        logModule.log('[HybridDevice] Config file loaded.');
    })
    .catch(function(error){
        logModule.log('[HybridDevice] Config file not found: ', error);
    });
};

Device.updateDictionary = function(baseURL) {
    return axios.get(baseURL + dictionariApi)
    .then(function(response) {

        return Promise.all([
            File.write(
                Device.applicationStorage() + dictionaryFileName,
                JSON.stringify(response.data)
            ),
            Promise.resolve({
                dictionary: response.data
            })
        ]);
    })
    .then(function(result){
        logModule.log('[HybridDevice] Saved dictionary file.', result);

        return result[1];
    })
    .catch(function(error) {
        logModule.err('[HybridDevice] Error updating dictionary file.', error);
    });
};

Device.updateConfig = function(baseURL, configApi) {
    return axios.get(baseURL + configApi)
    .then(function(response) {

        return Promise.all([
            File.write(
                Device.applicationStorage() + configFileName,
                JSON.stringify(response.data)
            ),
            Promise.resolve({
                config: response.data
            })]
        );
    })
    .then(function(result){
        logModule.log('[HybridDevice] Saved config file.', result);

        return result[1];
    })
    .catch(function(error) {
        logModule.err('[HybridDevice] Error updating config file.', error);
    });
};

Device.updateCachedConfigs = function(baseURL, configApi) {
    return Promise.all([
        Device.updateDictionary(baseURL),
        Device.updateConfig(baseURL, configApi)
    ])
    .then(function(result) {
        return {
            dictionary: result[0].dictionary,
            config: result[1].config
        };
    });
};

Device.getCurrentRequestCountry = function(Config) {
    if (Config.HYBRID_MULTICOUNTRY_FORCE_TEST) {
        return Promise.resolve(Config.HYBRID_MULTICOUNTRY_FORCE_TEST);
    }
    return axios.get(
        Config.DEST_DOMAIN + Config.NETWORK_INFO_API_URL,
        {
            timeout: 10000
        }
    )
    .then(function(result){
        logModule.log('[HybridDevice] getCurrentRequestCountry(): ' + result.data.realCountry, result);
        return result.data.realCountry;
    })
    .catch(function(error) {
        logModule.err('[HybridDevice] getCurrentRequestCountry() Error: ' + error, error);
    });
};

Device.loadCSS = function(Config) {
    // <link rel="stylesheet" href="<TMPL_VAR NAME=LESS_URL>?file=<TMPL_VAR NAME=LESS_CSS_NAME>&country=<TMPL_VAR NAME=API_COUNTRY>&v=<TMPL_VAR NAME=SERVICE_CSS_VERSION>&nocompile=<TMPL_VAR NAME=lessnew>&IS_STAGING=<TMPL_VAR NAME=IS_STAGING>" />
    return axios.get(
        Config.LESS_URL + '?file=' + Config.LESS_CSS_NAME 
            + '&country=' + Config.API_COUNTRY 
            + '&v=' + Config.SERVICE_CSS_VERSION 
            + '&nocompile=' + Config.lessnew 
            + '&IS_STAGING=' + Config.IS_STAGING
    )
    .then(function(result){
        logModule.log('[HybridDevice] loadCSS() Loaded CSS file.', result);
        return result.data;
    })
    .catch(function(error) {
        logModule.err('[HybridDevice] loadCSS() Error saving CSS file.', error);
    });
};

Device.injectCSS = function(CSScontent) {
    var sheet = document.createElement('style');
    sheet.innerHTML = CSScontent;
    document.body.appendChild(sheet);
};

Device.injectExternalCSS = function(Config) {
    var cssUrl = Config.LESS_URL + '?file=' + Config.LESS_CSS_NAME 
        + '&country=' + Config.API_COUNTRY 
        + '&v=' + Config.SERVICE_CSS_VERSION 
        + '&nocompile=' + Config.lessnew 
        + '&IS_STAGING=' + Config.IS_STAGING;
    
    var cssId = Config.API_COUNTRY + Config.LESS_CSS_NAME;
    
    if (document.getElementById(cssId)) {
        logModule.log('[HybridDevice] injectExternalCSS() CSS already available in DOM.', cssId);            
        return Promise.resolve({ loaded: true, url: cssUrl, id: cssId });
    }


    // var head = document.getElementsByTagName('head')[0];
    // var link = document.createElement('link');
    // link.id = cssId;
    // link.rel = 'stylesheet';
    // link.type = 'text/css';
    // link.href = cssUrl;
    // link.media = 'all';
    // head.appendChild(link);

    return new Promise(function(resolve, reject) {
        
        var style = document.createElement('style');
        style.textContent = '@import "' + cssUrl + '"';
        style.id = cssId;

        var fi = setInterval(function() {
            try {
                var temp = style.sheet.cssRules[0].styleSheet.cssRules.length; // <--- MAGIC: only populated when file is loaded
                clearInterval(fi);
                logModule.log('[HybridDevice] injectExternalCSS() CSS loaded in DOM.', style.sheet.cssRules);                        
                resolve({ loaded: true, url: cssUrl, id: cssId });
            } catch (e) {
                // no op
            }
        }, 50);  

        document.getElementsByTagName('head')[0].appendChild(style);
    });
};

Device.initHybridStatusFile = function() {
    // 
    return File.readFileAsJSON(
        Device.applicationStorage() + statusFileName
    )
    .then(function(resultFile) {
        // file exists, return it's content
        return resultFile;
    })
    .catch(function(error) {
        // file not exists
        
        var status = {
            firstLoadDate: (new Date(Date.now())).toLocaleString()
        };
        return File.write(
            Device.applicationStorage() + statusFileName,
            JSON.stringify(status)
        )
        .then(function() {
            logModule.log('[HybridDevice] initHybridStatusFile() FIRSTLOAD ');            
            
            return false;
        })
        .catch(function(error2) {
            // FIXME: to do better handling of this error
            logModule.err('[HybridDevice] initHybridStatusFile() cannot write file!', error2);

            throw error2;
        });
    });
};

Device.initCordova = function() {
    return new Promise(
        function(resolve, reject) {

            // wait for cordova to loaded all plugins
            document.addEventListener('deviceready', function() {
                
                resolve();

            }, false);
        }
    );
};

Device.hideCordovaSplash = function() {
    navigator.splashscreen.hide();
    return Promise.resolve();
};

Device.waitForConnection = function(options) {
    var states = {};
    states[Connection.UNKNOWN] = 'Unknown';
    states[Connection.ETHERNET] = 'Ethernet';
    states[Connection.WIFI] = 'WiFi';
    states[Connection.CELL_2G] = 'Cell 2G';
    states[Connection.CELL_3G] = 'Cell 3G';
    states[Connection.CELL_4G] = 'Cell 4G';
    states[Connection.CELL] = 'Cell generic';
    states[Connection.NONE] = 'No network';

    return new Promise(function(resolve, reject) {
        var networkState = navigator.connection.type;
        if (networkState === Connection.NONE) {

            // if i need to show something when no connection 
            if (options && options.onNoConnection && typeof options.onNoConnection === 'function') {
                var onNoConnection = options.onNoConnection;
                onNoConnection();
            }

            // wait indefinitely for online event
            document.addEventListener('online', function() {
                
                // if i need to hide something when connection arrive
                if (options && options.onConnection && typeof options.onConnection === 'function') {
                    var onConnection = options.onConnection;
                    onConnection();
                }
                // 
                networkState = navigator.connection.type;
                resolve({
                    connection: states[networkState]
                });
            }, false);
        } else {
            resolve({
                connection: states[networkState]
            });
        }
    });
    
};

Device.initHybridApp = function(options) {
    if (typeof options !== 'object') {
        return Promise.reject(new Error('Parameters error, missing options'));
    }
    if (typeof options.config !== 'object') {
        return Promise.reject(new Error('Parameters error, missing options.config'));
    }

    var isMultiCountry = options.config.HYBRID_ISMULTICOUNTRY;
    var multiCountryMapHostnames = options.config.HYBRID_MULTICOUNTRYMAP;
    var result;
    var startDate = Date.now();
    
    if (!options.saveConfigCb || typeof options.saveConfigCb !== 'function') {
        return Promise.reject(new Error('Parameters error, missing saveConfigCb in options'));
    }
    if (!options.saveDictionaryCb || typeof options.saveDictionaryCb !== 'function') {
        return Promise.reject(new Error('Parameters error, missing saveDictionaryCb in options'));
    }

    return Device.initCordova()
    .then(function() {
        return Device.waitForConnection(options);
    })
    .then(function() {
        return Device.initHybridStatusFile();
    })
    .then(function(statusFile) {

        var isFirstLoad = !statusFile;

        if (isFirstLoad && isMultiCountry && multiCountryMapHostnames) {
            result = Device.getCurrentRequestCountry(options.config)
            .then(function(realCountry) {
                var useCountry = realCountry;
                if (!multiCountryMapHostnames[realCountry]) {
                    useCountry = options.config.HYBRID_MULTICOUNTRY_FALLBACK;
                }
                logModule.log('[HybridDevice] initHybridApp() getCurrentRequestCountry(): ' + realCountry + '; using: ' + useCountry, multiCountryMapHostnames);            

                if (multiCountryMapHostnames[useCountry]) {
                    // get hostname to use for this country
                    var hostname = multiCountryMapHostnames[useCountry];
                    logModule.log('[HybridDevice] initHybridApp() using baseurl: ' + hostname);
                    
                    // load and save config and dictionary
                    return Device.updateCachedConfigs(hostname, options.configApi)
                    .then(function(resultUpdateCache) {
                        // use new config and dictionary
                        var cbConf = options.saveConfigCb;
                        var cbDict = options.saveDictionaryCb;
                        cbConf(resultUpdateCache.config);
                        cbDict(resultUpdateCache.dictionary);

                        return Device.injectExternalCSS(options.config);
                    });
                } else {
                    return Promise.reject('Multicountry hostname not found!');
                }
            });
        } else {
            result = Promise.all([
                Device.setDictionary(options),
                Device.setConfig(options)
            ])
            .then(function(){
                // keep cached configs file updated for next load
                Device.updateCachedConfigs(options.config.DEST_DOMAIN, options.configApi);

                return Device.injectExternalCSS(options.config);
            });
        }

        return result
        .then(function() {
            return Device.hideCordovaSplash();
        })
        .then(function() {
            var elapsedTime = Math.abs((startDate - Date.now()) / 1000);
            logModule.log('[HybridDevice] initHybridApp() done, after s: ' + elapsedTime + '.');
        });
    });
};

var getMfpSession = function(options) {
    return axios.get(options.mfp.url, {
        params: {
            apikey: options.mfp.apiKey,
            country: options.mfp.country,
            expire: '',
            contents_inapp: JSON.stringify({
                api_country: options.mfp.apiCountry,
                country: options.mfp.country,
                fpnamespace: options.mfp.namespace
            })
        },
        timeout: options.timeOutMs
    })
    .then(function(mfpResult) {
        var returnUrl,
            pony,
            tracking,
            jsonStruct;

        logModule.log('[HybridDevice] getMfpSession() got response: ' + mfpResult.status, mfpResult);            
        if (mfpResult.data.content.inappInfo) {
            jsonStruct = JSON.parse(mfpResult.data.content.inappInfo);                
            if (jsonStruct.extData) {
                if (jsonStruct.extData.ponyUrl) {
                    pony = jsonStruct.extData.ponyUrl;
                }
                if (jsonStruct.extData.return_url) {
                    returnUrl = jsonStruct.extData.return_url;
                }
                if (jsonStruct.extData.session_mfp) {
                    tracking = jsonStruct.extData.session_mfp;
                }
            } else {
                throw new Error('no fingerprint session found');
            }
        } else {
            throw new Error('no fingerprint data found');
        }
        return {
            mfp: true,
            pony: pony,
            returnUrl: returnUrl,
            tracking: tracking
        };
    });
};
var getAppsFlyerSession = function(options) {
    if (!window.plugins || !window.plugins.appsFlyer) {
        // plugin is not installed
        return Promise.reject('missing AppsFlyer Cordova plugin');
    }

    var apInitArgs = {
        devKey: options.af.devKey,
        isDebug: false,
        onInstallConversionDataListener: true,
        appId: options.af.appStoreAppId
    };

    return new Promise(function(resolve, reject) {
        //
        window.plugins.appsFlyer.initSdk(
            apInitArgs,
            function(afResult) {
                // success callback
                var returnUrl,
                    pony;
                
                var conversionData = afResult;

                logModule.log('[HybridDevice] getAppsFlyerSession() afResult: ' + JSON.stringify(afResult), afResult);                    
            
                if (typeof conversionData === 'string') {
                    conversionData = JSON.parse(conversionData);
                }
                if (conversionData.type && conversionData.type === 'onInstallConversionDataLoaded' && conversionData.data) {
                    conversionData = conversionData.data;
                }

                if (options.af.conversionDataCallBack && typeof options.af.conversionDataCallBack === 'function') {
                    
                    window.setTimeout(function(){
                        try {
                            var cb = options.af.conversionDataCallBack;
                            cb(conversionData);
                            logModule.log('[HybridDevice] getAppsFlyerSession() conversionDataCallBack called with parameters: ' + JSON.stringify(conversionData), conversionData);
                            
                        } catch (error) {
                            logModule.err('[HybridDevice] getAppsFlyerSession() error calling conversionDataCallBack: ' + error, error);
                        }
                    }, 10);
                }

                if (options.af.fieldPony && conversionData[options.af.fieldPony]) {
                    pony = conversionData[options.af.fieldPony];
                }
                if (options.af.fieldReturnUrl && conversionData[options.af.fieldReturnUrl]) {
                    returnUrl = conversionData[options.af.fieldReturnUrl];
                }
                
                if (!pony) {
                    reject(new Error('no appsflyer session found'));
                }

                resolve({
                    af: true,
                    pony: pony,
                    returnUrl: returnUrl,
                    tracking: ''
                });
            },
            function(error){
                // error callback
                logModule.err('[HybridDevice] getAppsFlyerSession() error: ' + error, error);
                reject(new Error(error));
            }
        );
    });
};

/**
 * getBrowserSession() - return session storeded from webapp before starting the app; it uses fingerprinting technology
 * @param {options} - object with options
 * @param {options.timeOutMs} - Milliseconds to wait for a session from any subsystem used
 * @param {options.mfp} - object with options for Mobile Finger Print API subsystem
 * @param {options.af} - object with options for AppsFlyer subsystem
 * @param {options.mfp.url} - 
 * @param {options.mfp.apiKey} - 
 * @param {options.mfp.country} - 
 * @param {options.mfp.apiCountry} - 
 * @param {options.mfp.namespace} - 
 * @param {options.af.fieldPony} - 
 * @param {options.af.fieldReturnUrl} - 
 * @param {options.af.devKey} - 
 * @param {options.af.appStoreAppId} - 
 * @param @deprecated {options.af.conversionDataCallBack} - <Function>
 * @returns {Promise} - Object{pony,returnUrl}
 */
Device.getBrowserSession = function(options) {

    // return the first promise that resolve
    function oneSuccess(promises){
        return Promise.all(promises.map(
            function(p) {
                // If a request fails, count that as a resolution so it will keep
                // waiting for other possible successes. If a request succeeds,
                // treat it as a rejection so Promise.all immediately bails out.
                return p.then(
                    function(val) { return Promise.reject(val); },
                    function(err) { return Promise.resolve(err); }
                );
            })
        ).then(
            // If '.all' resolved, we've just got an array of errors.
            function(errors) { return Promise.reject(errors); },

            // If '.all' rejected, we've got the result we wanted.
            function(val) { return Promise.resolve(val); }
        );
    }

    // return the promise or reect it if timeout occur first
    function timeoutPromise(ms, promise) {
        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                reject(new Error('timeout'));
            }, ms);
            promise.then(resolve, reject);
        });
    }

    var subSystems = [];
    if (options.mfp) {
        subSystems.push(timeoutPromise(
            options.timeOutMs,
            getMfpSession(options)
        ));
    }
    if (options.af) {
        subSystems.push(timeoutPromise(
            options.timeOutMs,
            getAppsFlyerSession(options)
        ));
    }
    if (subSystems.length < 1) {
        return Promise.reject('Parameters error, no subSystem specified: AF or MFP');
    }

    var startDate = Date.now();

    return oneSuccess(
        subSystems
    )
    .then(function(result) {
        var elapsedTime = Math.abs((startDate - Date.now()) / 1000);
        logModule.log('[HybridDevice] getBrowserSession() done, after s: ' + elapsedTime + '.', result);
        return result;
    })
    .catch(function(error) {
        var elapsedTime = Math.abs((startDate - Date.now()) / 1000);
        logModule.log('[HybridDevice] getBrowserSession() error/nodata: ' + error, error);
    });
};

module.exports = Device;