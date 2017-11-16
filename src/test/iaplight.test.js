var Promise = require('promise-polyfill');

var Mock = require('../../test/mock');
var iaplight = require("../iaplight");

var overrideUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.8 Safari/534.34";

function SimulateEvent(eventName, attrs, time, target){
    var _target;

    if(target && target === "window"){
        _target = window;
    }else{
        _target = document;
    }

    var event = document.createEvent('CustomEvent');
    for(var key in attrs){
        if(!event.hasOwnProperty(key)){
            event[key] = attrs[key];
        }
    }
    event.initEvent(eventName, true, true);
    setTimeout(function(){
        _target.dispatchEvent(event);
    }, time || 1000);
}


var iaplightProduct1 = {
    "productId": "com.mycompany.myproduct.weekly.v1",
    "title": "Premium weekly subscription",
    "description": "Premium weekly subscription to my beatiful product",
    "price": "€0,99"
};
var iaplightProduct2 = {
    "productId": "com.mycompany.myproduct.montly.v1",
    "title": "Premium montly subscription",
    "description": "Premium montly subscription to my beatiful product",
    "price": "€3,99"
};
var iaplightReceiptBundleOrg = {
    "originalAppVersion": "1.0",
    "appVersion": "0.1.0",
    "inAppPurchases": [ {
        "transactionIdentifier":"123412341234",
        "quantity":1,
        "purchaseDate":"2016-07-05T10:15:21Z",
        "productId":iaplightProduct1.productId,
        "originalPurchaseDate":"2016-07-05T10:15:22Z",
        "subscriptionExpirationDate":"2016-07-05T10:18:21Z",
        "originalTransactionIdentifier":"123412341234",
        "webOrderLineItemID":-1497665198,
        "cancellationDate":null
    },
    {
        "transactionIdentifier":"123412341256",
        "quantity":1,
        "purchaseDate":"2016-07-03T10:15:21Z",
        "productId":iaplightProduct1.productId,
        "originalPurchaseDate":"2016-07-03T10:15:22Z",
        "subscriptionExpirationDate":"2016-07-03T10:18:21Z",
        "originalTransactionIdentifier":"123412341256",
        "webOrderLineItemID":-1497665195,
        "cancellationDate":null
    } ],
    "bundleIdentifier": "com.mycompany.myapp"
};
var iaplightReceiptBundle = JSON.parse(JSON.stringify(iaplightReceiptBundleOrg));

var iaplightRestoreResult = {};
var iaplightRestoreResultIosBase = [
    {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-05T10:27:21Z","transactionId":"1000000222595453","state":3},
    {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-05T10:21:21Z","transactionId":"1000000222595454","state":3},
    {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-08T11:04:50Z","transactionId":"1000000222595455","state":3},
    {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-08T10:58:50Z","transactionId":"1000000222595456","state":3},
    {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-08T11:01:50Z","transactionId":"1000000222595457","state":3},
    {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-08T12:59:06Z","transactionId":"1000000222595458","state":3},
    {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-05T10:30:21Z","transactionId":"1000000222595459","state":3},
    {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-08T12:49:07Z","transactionId":"1000000222595460","state":3},
    {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-08T11:07:50Z","transactionId":"1000000222595461","state":3},
    {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-05T10:15:21Z","transactionId":"1000000222595462","state":3},
    {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-05T10:18:21Z","transactionId":"1000000222595463","state":3},
    {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-08T10:55:50Z","transactionId":"1000000222595464","state":3},
    {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-05T10:24:21Z","transactionId":"1000000222595465","state":3},
    {"productId":"com.mycompany.myproduct.weekly.v1","date":"2016-07-08T11:10:50Z","transactionId":"1000000222595466","state":3}
];
var iaplightRestoreResultAndroidOk = [
    {
        "productId":iaplightProduct1.productId,
        "transactionId":"",
        "type":"subs",
        "productType":"subs",
        "signature":"xxxxxxxx==",
        "receipt":"{\"packageName\":\"com.mycompany.myproduct\",\"productId\":\""+iaplightProduct1.productId+"\",\"purchaseTime\":1491209382421,\"purchaseState\":0,\"purchaseToken\":\"nknmjmadpdhibpnaeibbxxxx\",\"autoRenewing\":true}"
    }
];

var iaplightRestoreResultAndroidKo = [];

var iaplightSubscribeMockResult = {
"transactionId":"1000000221696692",
"receipt":"MXXXX"
};
var iaplightSubscribeMockResultIos = {
"transactionId":"1000000221696692",
"receipt":"MXXXX"
};
var timePurchase10MinAgo = ((
    (new Date(
            (   +(new Date()) - 600 * 1000  )
        )
    ).getTime()) / 1000).toFixed(0);
var timePurchase10MinAgoStr = (new Date(timePurchase10MinAgo*1000)).toISOString()

var iaplightSubscribeMockResultAndroid = {
    "signature":"EjwaorJ8D5yD9F7t7yQgRvHBjk+Ga53seIilDuzzLmv05cc0LiV/WAqUE+NHq+CGTnogtxnb/rjSAxo+K2S6xg8kskZQvRzYNxo0YBhvhCRr5VKrvQO+VZTwM3RKfNlDGdCYw7rEuuvcvH733wzPGdeKmLKw4JI7wk6ViVMEgq7ub7dOTwiv8rSVqf/2sIbD96yhh3d55jWiBdbwCzLvaVcLKTAD6oG78bW7n9FbTAcdDEMxAeNEDJw90fANA/MXvvO1tp6rcFy/emqDCZcinv+zal5rQQc7M372YW6iBqWWm+zemexH6DrVsdjdGEsI6X1Rmk8Y8M1bnwnYKCACaA==",
    "productId":iaplightProduct1.productId,
    "transactionId":"gjmkkfbapgplpdallcgpbaol.AO-J1OxwQeGM0H3ru88F1BVqSYtUT-4VsS3U9a0tlWomLk7kvvpNQoMlAVX3_mZ2aiu5X50luuLSeO31QxwwldN9jczTU_H6UMkD1tq1hLILWE1-nAkq9VrOpoW0Jz4rbQnUwZHb_wwZ",
    "type":"subs",
    "productType":"subs",
    "receipt":"{\"packageName\":\"com.mycompany.myproduct\", \"productId\":\""+iaplightProduct1.productId+"\", \"purchaseTime\":"+timePurchase10MinAgo+", \"purchaseState\":0, \"purchaseToken\":\"4rbQnUwZHb_wwZ\", \"autoRenewing\":true }"
};
var iaplightSubscribeResultAndroid = {
    "productId": iaplightProduct1.productId,
    "transactionId": iaplightSubscribeMockResultAndroid.transactionId,
    "purchaseDate": timePurchase10MinAgoStr,
    "purchaseTime": timePurchase10MinAgo,
};
var iaplightSubscribeResultIos = {
    "productId": iaplightProduct1.productId,
    "transactionId": iaplightReceiptBundle.inAppPurchases[0].transactionIdentifier,
    "purchaseDate": timePurchase10MinAgoStr,
    "purchaseTime": timePurchase10MinAgo,
};


describe("Stargate IAP Light", function() {
    
    beforeEach(function() {
        
        
		Mock.cookie_mock.val.hybrid = 1;
		window.Cookies = Mock.cookie_mock;

		window.device = Mock.spec_device_mock;
		window.hostedwebapp = Mock.hostedwebapp_mock;
		window.cordova = Mock.cordova_mock;
		window.StatusBar = Mock.statusbar_mock;
		navigator.splashscreen = Mock.navigator_splashscreen_mock;
        navigator.connection = Mock.navigator_connection_mock;
		//window.store = store_mock;
		//window.storekit = storekit_mock;
		
		//log = jasmine.createSpy();

		getManifest = function(){
			return Promise.resolve(Mock.manifest_mock);
		};

        //document.removeEventListener("deviceready",onDeviceReady, false);
        
        if (!window.plugins) {
            window.plugins = {};
        }
        // reset receipt bundle
        iaplightReceiptBundle = JSON.parse(JSON.stringify(iaplightReceiptBundleOrg))

        window.inAppPurchase = {
            getProducts: function(productsId) {
                return new Promise(function(resolve,reject){
                    var res = [];
                    productsId.forEach(function(pidParam){
                        if (pidParam === iaplightProduct1.productId) {
                            res.push(iaplightProduct1);
                        } else if (pidParam === iaplightProduct2.productId) {
                            res.push(iaplightProduct2);
                        }
                    });
                    resolve(res);
                });
            },
            restorePurchases: function(productId) {
                return new Promise(function(resolve,reject){
                    resolve(iaplightRestoreResult);
                });
            },
            subscribe: function(productId) {
                return new Promise(function(resolve,reject){
                    resolve(iaplightSubscribeMockResult);
                });
            },
            getReceiptBundle: function() {
                return new Promise(function(resolve,reject){
                    resolve(iaplightReceiptBundle);
                });
            }
        };

        iaplight.__clean__();
    });
    
    it("getProductInfo require module init", function(done) {
        var res = iaplight.getProductInfo("com.myproduct");
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/Not initialized/);
		    done();
		});
	});

	it("subscribe require module init", function(done) {
        var res = iaplight.subscribe("com.myproduct");
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/Not initialized/);
		    done();
		});
	});

	it("getExpireDate require module init", function(done) {
        var res = iaplight.isSubscribed(iaplightReceiptBundle.inAppPurchases[0].productId);
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/Not initialized/);
		    done();
		});
	});

    it("restore require module init", function(done) {
        var res = iaplight.restore();
        expect(res.then).toBeDefined();
		res.catch(function(message) {
            expect(message).toMatch(/Not initialized/);
		    done();
		});
	});
    
    it("initialize require cordova plugin", function(done) {
		
        window.device.platform = "Android";

        window.inAppPurchase = null;

        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        expect(init.then).toBeDefined();
        init.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).toMatch(/missing cordova plugin/);
		    done();
		});
	});

    it("initialize check parameters", function(done) {
		
        window.device.platform = "Android";

        var init = iaplight.initialize({
            //productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        expect(init.then).toBeDefined();
        init.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).toMatch(/missing parameter productsId/);
		    done();
		});
	});
    it("initialize check parameters is array", function(done) {
		
        window.device.platform = "Android";

        var init = iaplight.initialize({
            productsIdAndroid: "aaaaa",
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        expect(init.then).toBeDefined();
        init.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).toMatch(/must be an array/);
		    done();
		});
	});
    it("initialize check parameters is array lenght", function(done) {
		
        window.device.platform = "Android";

        var init = iaplight.initialize({
            productsIdAndroid: []
        });
        expect(init.then).toBeDefined();
        init.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).toMatch(/must contains at least a productid/);
		    done();
		});
	});

    it("initialize return same promise as before", function(done) {
		
        window.device.platform = "Android";

        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        expect(init.then).toBeDefined();
        init.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
        init.then(function(result) {
            var init2 = iaplight.initialize({
                productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
                productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
            });
            expect(init2).toBe(init);
            done();
		});
	});

    it("initialize ios", function(done) {
		
        window.device.platform = "iOS";
        
        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId],
            productsIdIos: [iaplightProduct2.productId],
        });
        expect(init.then).toBeDefined();
        init.catch(function(message) {
			//console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
        init.then(function(result) {
			//console.log("iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate: "+iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate);
            //console.log("result: "+result);
            expect(result).toEqual([iaplightProduct2]);
            done();
		});
	});

    it("iaplight isSubscribed Android Subscribed", function(done) {
		
        window.device.platform = "Android";
        appPackageName = "com.mycompany.myproduct";
        iaplightRestoreResult = iaplightRestoreResultAndroidOk;

        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        init.catch(function(message) {
			console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});

        expect(init.then).toBeDefined();

		var res = iaplight.isSubscribed(iaplightProduct1.productId);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate: "+iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate);
            //console.log("result: "+result);
            var isSubscribed = true;
            
            expect(result).toEqual(isSubscribed)
            done();
		});
	});

    it("iaplight isSubscribed Android Expired", function(done) {
		
        window.device.platform = "Android";

        iaplightRestoreResult = iaplightRestoreResultAndroidKo;


        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        init.catch(function(message) {
			console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});

        expect(init.then).toBeDefined();

		var res = iaplight.isSubscribed(iaplightProduct1.productId);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate: "+iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate);
            //console.log("result: "+result);
            var isSubscribed = false;
            
            expect(result).toEqual(isSubscribed)
            done();
		});
	});

    it("iaplight isSubscribed iOS subscribed", function(done) {
		
        window.device.platform = "iOS";

        // set a purchaseDate 10 minutes in the past
        iaplightReceiptBundle.inAppPurchases[0].purchaseDate =
            iaplightReceiptBundle.inAppPurchases[0].originalPurchaseDate =
            (new Date((+(new Date()) - 600 * 1000))).toISOString();
        
        // set a subscriptionExpirationDate 10 minutes in the future
        iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate = 
            (new Date((+(new Date()) + 600 * 1000))).toISOString();

        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        init.catch(function(message) {
			console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});

        expect(init.then).toBeDefined();

		var res = iaplight.isSubscribed(iaplightReceiptBundle.inAppPurchases[0].productId);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate: "+iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate);
            //console.log("result: "+result);
            var dateMock = new Date(iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate);
            var isSubscribed = true;
            
            expect(result).toEqual(isSubscribed)
            done();
		});
	});


    it("iaplight isSubscribed iOS expired", function(done) {
		
        window.device.platform = "iOS";

        // set a purchaseDate 20 minutes in the past
        iaplightReceiptBundle.inAppPurchases[0].purchaseDate =
            iaplightReceiptBundle.inAppPurchases[0].originalPurchaseDate =
            (new Date((+(new Date()) - 1200 * 1000))).toISOString();
        
        // set a subscriptionExpirationDate 10 minutes in the past
        iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate = 
            (new Date((+(new Date()) - 600 * 1000))).toISOString();


        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        init.catch(function(message) {
			console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});

        expect(init.then).toBeDefined();

		var res = iaplight.isSubscribed(iaplightReceiptBundle.inAppPurchases[0].productId);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate: "+iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate);
            //console.log("result: "+result);
            var dateMock = new Date(iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate);
            var isSubscribed = false;
            
            expect(result).toEqual(isSubscribed)
            done();
		});
	});


    it("iaplight getProductInfo", function(done) {
		
        window.device.platform = "Android";

        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        init.catch(function(message) {
			console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});

        expect(init.then).toBeDefined();

		var res = iaplight.getProductInfo(iaplightProduct1.productId);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toEqual(iaplightProduct1)
		});

        var res2 = iaplight.getProductInfo(iaplightProduct2.productId);
        
        expect(res2.then).toBeDefined();
        
		res2.catch(function(message) {
			console.log("iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res2.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toEqual(iaplightProduct2)
		    done();
		});
	});

    it("iaplight subscribe Android", function(done) {
		
        window.device.platform = "Android";
        
        appPackageName = "com.mycompany.myproduct";
        iaplightSubscribeMockResult = iaplightSubscribeMockResultAndroid;

        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        init.catch(function(message) {
			console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});

        expect(init.then).toBeDefined();

		var res = iaplight.subscribe(iaplightProduct1.productId);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toEqual(iaplightSubscribeResultAndroid);
            done();
		});
	});

    it("iaplight subscribe iOS", function(done) {
		
        window.device.platform = "iOS";

        appPackageName = "com.mycompany.myproduct";
        iaplightSubscribeMockResult = iaplightSubscribeMockResultIos;

        // set a purchaseDate 10 minutes in the past
        iaplightReceiptBundle.inAppPurchases[0].purchaseDate =
            iaplightReceiptBundle.inAppPurchases[0].originalPurchaseDate =
            timePurchase10MinAgoStr;
        
        // set a subscriptionExpirationDate 10 minutes in the future
        iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate = 
            (new Date((+(new Date(timePurchase10MinAgo*1000)) + 1200 * 1000))).toISOString();


        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        init.catch(function(message) {
			console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});

        expect(init.then).toBeDefined();

		var res = iaplight.subscribe(iaplightProduct1.productId);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toEqual(iaplightSubscribeResultIos);
            done();
		});
	});

    it("iaplight subscribeReceipt Android", function(done) {
		
        window.device.platform = "Android";
        
        appPackageName = "com.mycompany.myproduct";
        iaplightSubscribeMockResult = iaplightSubscribeMockResultAndroid;

        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        init.catch(function(message) {
			console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});

        expect(init.then).toBeDefined();

		var res = iaplight.subscribeReceipt(iaplightProduct1.productId);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toEqual(iaplightSubscribeMockResultAndroid);
            done();
		});
	});

    it("iaplight subscribeReceipt iOS", function(done) {
		
        window.device.platform = "iOS";

        appPackageName = "com.mycompany.myproduct";
        iaplightSubscribeMockResult = iaplightSubscribeMockResultIos;

        // set a purchaseDate 10 minutes in the past
        iaplightReceiptBundle.inAppPurchases[0].purchaseDate =
            iaplightReceiptBundle.inAppPurchases[0].originalPurchaseDate =
            timePurchase10MinAgoStr;
        
        // set a subscriptionExpirationDate 10 minutes in the future
        iaplightReceiptBundle.inAppPurchases[0].subscriptionExpirationDate = 
            (new Date((+(new Date(timePurchase10MinAgo*1000)) + 1200 * 1000))).toISOString();


        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        init.catch(function(message) {
			console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});

        expect(init.then).toBeDefined();

		var res = iaplight.subscribeReceipt(iaplightProduct1.productId);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toEqual(iaplightSubscribeMockResultIos);
            done();
		});
    });
    
    it("iaplight restore empty with false", function(done) {
		
        window.device.platform = "Android";
        iaplightRestoreResult = false;

        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        init.catch(function(message) {
			console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});

        expect(init.then).toBeDefined();

		var res = iaplight.restore();
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toEqual(iaplightRestoreResult);
            done();
		});
	});

    it("iaplight getActiveSubscriptionsInfo Android", function(done) {
		
        window.device.platform = "Android";
        iaplightRestoreResult = {};
        
        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        init.catch(function(message) {
			console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});

        expect(init.then).toBeDefined();

		var res = iaplight.getActiveSubscriptionsInfo();
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toEqual(iaplightRestoreResult);
            done();
		});
	});

    it("iaplight getActiveSubscriptionsInfo iOS", function(done) {
		
        window.device.platform = "iOS";
        iaplightRestoreResult = {};
        
        var init = iaplight.initialize({
            productsIdAndroid: [iaplightProduct1.productId, iaplightProduct2.productId],
            productsIdIos: [iaplightProduct1.productId, iaplightProduct2.productId],
        });
        init.catch(function(message) {
			console.log("iaplight.init catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});

        expect(init.then).toBeDefined();

		var res = iaplight.getActiveSubscriptionsInfo();
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("iaplight.getProductInfo catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toEqual(iaplightRestoreResult);
            done();
		});
	});

});
