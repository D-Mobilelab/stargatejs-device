var Promise = require('promise-polyfill');

var Mock = {
    
    spec_hybrid_conf_expected: {
        IAP: {
            id: 'stargate.test.spec.subscription',
            alias: 'Stargate Test Subscription',
            type: 'PAID_SUBSCRIPTION'
        },
        mfp: {
            country: 'xx'
        }
    },

    spec_hybrid_conf_uriencoded: '%7B%22IAP%22%3A%20%7B%22id%22%3A%22stargate.test.spec.subscription%22%2C%22alias%22%3A%22Stargate%20Test%20Subscription%22%2C%22type%22%3A%22PAID_SUBSCRIPTION%22%7D%7D',

    spec_modules_conf: {
        iap: {
            id: 'stargate.test.spec.subscription',
            alias: 'Stargate Test Subscription',
            type: 'PAID_SUBSCRIPTION'
        },
        mfp: {
            country: 'xx'
        }
    },

    spec_device_mock: {
        available: true,
        cordova: '0.0.0',
        manufacturer: 'stargate',
        model: 'one',
        platform: 'iOS',
        uuid: 'xxxxxxxxxxxxx',
        version: '0.0.2'
    },

    app_is_debug_mock: {
        debug: false
    },

    manifest_mock_single_country: {
        stargateConf: {
            title: 'Stargate Demo',
            url_match_app: '',
            country: 'xx',
            
            url_scheme: 'stargate://',
            version: '1',
            androidVersionCode: '1',
            motime_apikey: '1234567890',
            namespace: 'mynamespace',
            label: 'xx-label',
            billing_key: 'idufvweifviwenviwonviwuntgurntio',
            
            features: {
                newton: false,
                facebookconnect: true,
                mfp: true,
                gesturePlaymeVertical: false,
                gplusconnect: false,
                androidMenuPlayme: false,
                inappPurchase: true,
                deltadna: false,
                'offline-game': false
            },

            api: {
                mfpSetUriTemplate: '{protocol}://{hostname}/mfpset.php{?url,domain,_PONY}',
                mfpGetUriTemplate: 'http://fixme/v01/mobileFingerprint.get{?apikey,contents_inapp,country,expire}',
                googleToken: 'https://accounts.google.com/o/oauth2/token',
                userCreate: '%domain%/%country%/%selector%/%app_prefix%/store/usercreate/'
            },

            statusbar: {
                hideOnUrlPattern: [
                    '.*'
                ]
            },

            deltadna: {
                environmentKey: '111111111111111111111',
                collectApi: 'http://123123123.deltadna.net/collect/api',
                engageApi: 'http://113123123.deltadna.net',
                settings: {
                    onStartSendGameStartedEvent: true,
                    onFirstRunSendNewPlayerEvent: false
                }
            }
        }
    },

    manifest_mock_multi_country: {

        stargateConf: {},

        stargateConfCountries: {
            defaultCountry: 'xx',
            apiGetCountry: 'http://xxxxxxxx.xx/conf/info',

            xx: {

                title: 'Stargate Demo',
                url_match_app: '',
                country: 'xx',
                
                url_scheme: 'stargate://',
                version: '1',
                androidVersionCode: '1',
                motime_apikey: '1234567890',
                namespace: 'mynamespace',
                label: 'xx-label',
                billing_key: 'idufvweifviwenviwonviwuntgurntio',
                
                features: {
                    newton: false,
                    facebookconnect: true,
                    mfp: true,
                    gesturePlaymeVertical: false,
                    gplusconnect: false,
                    androidMenuPlayme: false,
                    inappPurchase: true,
                    deltadna: false,
                    'offline-game': false
                },

                api: {
                    mfpSetUriTemplate: '{protocol}://{hostname}/mfpset.php{?url,domain,_PONY}',
                    mfpGetUriTemplate: 'http://fixme/v01/mobileFingerprint.get{?apikey,contents_inapp,country,expire}',
                    googleToken: 'https://accounts.google.com/o/oauth2/token',
                    userCreate: '%domain%/%country%/%selector%/%app_prefix%/store/usercreate/'
                }
            },

            yy: {
                title: 'Stargate Demo',
                url_match_app: '',
                country: 'yy',
                
                url_scheme: 'stargate://',
                version: '1',
                androidVersionCode: '1',
                motime_apikey: '1234567890',
                namespace: 'mynamespace',
                label: 'yy-label',
                billing_key: 'idufvweifviwenviwonviwuntgurntio',
                
                features: {
                    newton: false,
                    facebookconnect: true,
                    mfp: true,
                    gesturePlaymeVertical: false,
                    gplusconnect: false,
                    androidMenuPlayme: false,
                    inappPurchase: true,
                    deltadna: false,
                    'offline-game': false
                },

                api: {
                    mfpSetUriTemplate: '{protocol}://{hostname}/mfpset.php{?url,domain,_PONY}',
                    mfpGetUriTemplate: 'http://fixme/v01/mobileFingerprint.get{?apikey,contents_inapp,country,expire}',
                    googleToken: 'https://accounts.google.com/o/oauth2/token',
                    userCreate: '%domain%/%country%/%selector%/%app_prefix%/store/usercreate/'
                }
            }
        }
    },

    manifest_mock_multi_country_default: {

        stargateConf: {},

        stargateConfCountries: {
            defaultCountry: 'xx',
            apiGetCountry: 'http://xxxxxxxx.xx/conf/info',

            xx: {
                title: 'Stargate Demo',
                url_match_app: '',
                country: 'xx',
                
                url_scheme: 'stargate://',
                version: '1',
                androidVersionCode: '1',
                motime_apikey: '1234567890',
                namespace: 'mynamespace',
                label: 'xx-label',
                billing_key: 'idufvweifviwenviwonviwuntgurntio',
                
                features: {
                    newton: false,
                    facebookconnect: true,
                    mfp: true,
                    gesturePlaymeVertical: false,
                    gplusconnect: false,
                    androidMenuPlayme: false,
                    inappPurchase: true,
                    deltadna: false,
                    'offline-game': false
                },

                api: {
                    mfpSetUriTemplate: '{protocol}://{hostname}/mfpset.php{?url,domain,_PONY}',
                    mfpGetUriTemplate: 'http://fixme/v01/mobileFingerprint.get{?apikey,contents_inapp,country,expire}',
                    googleToken: 'https://accounts.google.com/o/oauth2/token',
                    userCreate: '%domain%/%country%/%selector%/%app_prefix%/store/usercreate/'
                }
            }
        }
    },

    availableFeaturesMock: ['facebookconnect', 'mfp', 'inappPurchase'],
    
    appInformationMock: {
        cordova: '0.0.0',
        manufacturer: 'stargate',
        model: 'one',
        platform: 'iOS',
        deviceId: 'xxxxxxxxxxxxx',
        version: '0.0.2',
        packageVersion: '0.0.1',
        packageName: 'com.stargatejs.testapp',
        packageBuild: '0.0.1-test',
        stargate: '0.0.0-test',
        features: 'facebookconnect, mfp, inappPurchase',
        stargateModules: 'mfp, iapbase, appsflyer, game',
        connectionType: 'wifi'
    },

    statusbar_visibility: null,
    statusbar_color: null,
    
    navigator_splashscreen_mock: {
        hide: function() {}
    },

    cookie_mock: {
        val: {},
        get: function(name) { return this.val[name]; },
        set: function(name, value) { this.val[name] = value; return value; }
    },

    navigator_connection_mock: {
        type: 'wifi',
        getInfo: function(cb, cbe){}
    },

    Connection: {
        UNKNOWN: 'unknown',
        ETHERNET: 'ethernet',
        WIFI: 'wifi',
        CELL_2G: '2g',
        CELL_3G: '3g',
        CELL_4G: '4g',
        CELL: 'cellular',
        NONE: 'none'
    },

    SimulateEvent: function(eventName, attrs, time, target){
        var event = document.createEvent('CustomEvent');
        var _target;
    
        if(target && target === 'window'){
            _target = window;
        }else{
            _target = document;
        }
    
        Object.keys(attrs).map(function(key) {
            event[key] = attrs[key];
            return false;
        });
        event.initEvent(eventName, true, true);
        setTimeout(function(){
            _target.dispatchEvent(event);
        }, time || 1000);
    }
};

Mock.hostedwebapp_mock = {
    getManifest: function(cbOk, cbErr) {
        cbOk(Mock.manifest_mock);
    }
};

Mock.manifest_mock = Mock.manifest_mock_single_country;

Mock.spec_configurations = {
    country: 'xx',
    hybrid_conf: Mock.spec_hybrid_conf_uriencoded
};

Mock.statusbar_mock = {
    hide: function() { Mock.statusbar_visibility = false; },
    show: function() { Mock.statusbar_visibility = true; },
    backgroundColorByHexString: function(color) { Mock.statusbar_color = color; }
};

Mock.cordova_mock = {
    getAppVersion: {
        getVersionNumber: function() {
            return Promise.resolve('0.0.1');
        },
        getPackageName: function() {
            return Promise.resolve('com.stargatejs.testapp');
        },
        getVersionCode: function() {
            return Promise.resolve('0.0.1-test');
        }
    },
    plugins: {
        AppIsDebug: {
            get: function(cbOk, cbErr) {
                cbOk(Mock.app_is_debug_mock);
            }
        }
    },
    require: function(module){
        if (module === 'cordova/channel'){
            return {
                onPluginsReady: {
                    subscribe: function(func){
                        func();
                    }
                }
            };
        } else if (module === 'cordova/exec') {
            return {
                setJsToNativeBridgeMode: function(){},
                jsToNativeModes: {
                    IFRAME_NAV: '1'
                }
            };
        }
        return {};
    },
    InAppBrowser: {
        close: function (eventname) {
            //
        },
        show: function (eventname) {
            //
        },
        hide: function (eventname) {
            //
        },
        addEventListener: function (eventname, f) {
            //
        },
        removeEventListener: function (eventname, f) {
            //
        },
    
        executeScript: function (injectDetails, cb) {
            //
        },
    
        insertCSS: function (injectDetails, cb) {
            //
        },
    
        open: function() {}
    },
    file: {
        applicationDirectory: 'file:///android_asset/',
        applicationStorageDirectory: 'file:///data/data/io.cordova.hellocordova/',
        cacheDirectory: 'file:///data/data/io.cordova.hellocordova/cache/',
        dataDirectory: 'file:///data/data/io.cordova.hellocordova/files/',
        documentsDirectory: null,
        externalApplicationStorageDirectory: 'file:///storage/emulated/0/Android/data/io.cordova.hellocordova/',
        externalCacheDirectory: 'file:///storage/emulated/0/Android/data/io.cordova.hellocordova/cache/',
        externalDataDirectory: 'file:///storage/emulated/0/Android/data/io.cordova.hellocordova/files/',
        externalRootDirectory: 'file:///storage/emulated/0/',
        sharedDirectory: null,
        syncedDataDirectory: null,
        tempDirectory: null
    }
};


module.exports = Mock;