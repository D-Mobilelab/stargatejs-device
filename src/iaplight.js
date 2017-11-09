var Promise = require('promise-polyfill');
var device = require('./device');
var logModule = require('./log');

var iaplight = (
    function(){
    
        var protectedInterface = {};

        /*
        * inAppPurchase.getProducts(['com.mycompany.myproduct.weekly.v1']).then(function(res){console.log('res:'+JSON.stringify(res))})
        * res:[
        *     {
        *         'productId': 'com.mycompany.myproduct.weekly.v1',
        *         'title': 'Abbonamento Premium CalcioStar Italia',
        *         'description': 'Abonamento premium al catalogo CalcioStar Italia',
        *         'price': '€0,99'
        *     }
        * ]
        * 
        * inAppPurchase.subscribe('com.mycompany.myproduct.weekly.v1').then(function(res){console.log('res:'+JSON.stringify(res))}).catch(function(err){console.error(err)})
        * res:{
        *     'transactionId':'1000000221696692',
        *     'receipt':'MXXXX'
        * }
        * 
        * inAppPurchase.getReceiptBundle().then(function(res){console.log('res:'+JSON.stringify(res))})
        * res:{
        *     'originalAppVersion': '1.0',
        *     'appVersion': '0.1.0',
        *     'inAppPurchases': [
        *         {
        *             'transactionIdentifier':'1000000221696692',
        *             'quantity':1,
        *             'purchaseDate':'2016-07-05T10:15:21Z',
        *             'productId':'com.mycompany.myproduct.weekly.v1',
        *             'originalPurchaseDate':'2016-07-05T10:15:22Z',
        *             'subscriptionExpirationDate':'2016-07-05T10:18:21Z',
        *             'originalTransactionIdentifier':'1000000221696692',
        *             'webOrderLineItemID':-1497665198,
        *             'cancellationDate':null}
        *     ],
        *     'bundleIdentifier': 'com.mycompany.myproduct'
        * }
        */

        /**
         * 
         * Initialization promise generated from window.inAppPurchase.getProducts
         * all public interface wait for this promise to resolve
         * 
         */
        var initPromise = null;
        

        /**
         * Array of in app products id requested by webapp
         */
        var productsId = [];

        /**
         * Array of in app product information, like this: 
         * [{
         *   'productId': 'com.mycompany.myproduct.weekly.v1',
         *   'title': 'Premium subscription to myproduct',
         *   'description': 'Premium subscription to my beatiful product',
         *   'price': '€0,99'
         * }]
         */
        var productsInfo = [];

        /**
         * @param {object} initializeConf - configuration sent by
         * @return {boolean} - true if init ok
         */
        protectedInterface.initialize = function(initializeConf) {

            if (!window.inAppPurchase) {
                return Promise.reject('inAppPurchase not available, missing cordova plugin.');
            }

            if (initPromise !== null) {
                return initPromise;
            }

            if (initializeConf.productsIdAndroid || initializeConf.productsIdIos) {
                if (device.isRunningOnAndroid()) {
                    productsId = initializeConf.productsIdAndroid;
                } else if (device.isRunningOnIos()) {
                    productsId = initializeConf.productsIdIos;
                }
            }

            if (!productsId) {
                return Promise.reject('missing parameter productsId(Android|Ios)');
            }
            if (productsId && productsId.constructor !== Array) {
                return Promise.reject('parameter error, productsId(Android|Ios) must be an array');
            }
            if (productsId.length === 0) {
                return Promise.reject('parameter error, productsId(Android|Ios) must contains at least a productid');
            }
            

            initPromise = window.inAppPurchase.getProducts(productsId)
                .then(function(res){
                    productsInfo = res;
                    logModule.log('[IAPlight] getProducts ok', res);
                    return res;
                })
                .catch(function(error) {
                    logModule.err('[IAPlight] getProducts KO', error);
                });

            return initPromise;
        };

        protectedInterface.subscribe = function(productId) {
            
            if (initPromise === null) {
                return Promise.reject('Not initialized');
            }

            var subFunc = function() {
                return window.inAppPurchase.subscribe(
                    productId
                )
                .then(function(res){
                    logModule.log('[IAPlight] subscribe ok', res);

                    if (device.isRunningOnIos()) {
                        return protectedInterface.getActiveSubscriptionsInfo()
                        .then(function(resIos){
                            logModule.log('resIos:' + JSON.stringify(resIos));
                            if (!(productId in resIos)) {
                                throw new Error('Subscription information incomplete!' + productId);
                            }
                            var subscriptionInfo = resIos[productId];
                            var resultSusbscriptionIos = {
                                productId: subscriptionInfo.productId,
                                transactionId: subscriptionInfo.transactionIdentifier,
                                purchaseDate: subscriptionInfo.purchaseDate,
                                purchaseTime: (+(new Date(subscriptionInfo.purchaseDate).getTime()) / 1000).toFixed(0)
                            };
                            return resultSusbscriptionIos;
                        });
                    }

                    // {'signature':'EjwaorJ8D5yD9F7t7yQgRvHBjk+Ga53seIilDuzzLmv05cc0LiV/WAqUE+NHq+CGTnogtxnb/rjSAxo+K2S6xg8kskZQvRzYNxo0YBhvhCRr5VKrvQO+VZTwM3RKfNlDGdCYw7rEuuvcvH733wzPGdeKmLKw4JI7wk6ViVMEgq7ub7dOTwiv8rSVqf/2sIbD96yhh3d55jWiBdbwCzLvaVcLKTAD6oG78bW7n9FbTAcdDEMxAeNEDJw90fANA/MXvvO1tp6rcFy/emqDCZcinv+zal5rQQc7M372YW6iBqWWm+zemexH6DrVsdjdGEsI6X1Rmk8Y8M1bnwnYKCACaA==',
                    //  'productId':'pt.getstyle.weekly.v1',
                    //  'transactionId':'gjmkkfbapgplpdallcgpbaol.AO-J1OxwQeGM0H3ru88F1BVqSYtUT-4VsS3U9a0tlWomLk7kvvpNQoMlAVX3_mZ2aiu5X50luuLSeO31QxwwldN9jczTU_H6UMkD1tq1hLILWE1-nAkq9VrOpoW0Jz4rbQnUwZHb_wwZ',
                    //  'type':'subs',
                    //  'productType':'subs',
                    //  'receipt':'{\'packageName\':\'pt.getstyle\',
                    //              \'productId\':\'pt.getstyle.weekly.v1\',
                    //              \'purchaseTime\':1490946081110,
                    //              \'purchaseState\':0,
                    //              \'purchaseToken\':\'gjmkkfbapgplpdallcgpbaol.AO-J1OxwQeGM0H3ru88F1BVqSYtUT-4VsS3U9a0tlWomLk7kvvpNQoMlAVX3_mZ2aiu5X50luuLSeO31QxwwldN9jczTU_H6UMkD1tq1hLILWE1-nAkq9VrOpoW0Jz4rbQnUwZHb_wwZ\',
                    //              \'autoRenewing\':true
                    //            }'
                    //  }
                    if (device.isRunningOnAndroid()) {
                        var parsedReceipt = JSON.parse(res.receipt);
                        
                        return Promise.resolve(
                            {
                                productId: parsedReceipt.productId,
                                transactionId: res.transactionId,
                                purchaseDate: (new Date(parsedReceipt.purchaseTime * 1000)).toISOString(),
                                purchaseTime: parsedReceipt.purchaseTime + ''
                            }
                        );
                    }

                    logModule.err('[IAPlight] subscribe() unsupported platform!');
                    return Promise.reject('Unsupported platform!');
                })
                .catch(function(error){
                    logModule.err('[IAPlight] subscribe KO: ' + error, error);
                    throw error;
                });
            };

            // wait for initPromise if it didn't complete
            return initPromise.then(subFunc);
        };

        protectedInterface.getExpireDate = function(productId) {
            
            if (initPromise === null) {
                return Promise.reject('Not initialized');
            }

            var receiptFunc = function() {
                return window.inAppPurchase.getReceiptBundle()
                .then(function(res){
                    // return last purchase receipt (ordered by last subscriptionExpirationDate)

                    logModule.log('[IAPlight] getExpireDate getReceiptBundle ok', res);

                    /* res:{ 'originalAppVersion': '1.0',
                    *        'appVersion': '0.1.0',
                    *        'inAppPurchases': [ {
                    *                'transactionIdentifier':'123412341234',
                    *                'quantity':1,
                    *                'purchaseDate':'2016-07-05T10:15:21Z',
                    *                'productId':'com.mycompany.myapp.weekly.v1',
                    *                'originalPurchaseDate':'2016-07-05T10:15:22Z',
                    *                'subscriptionExpirationDate':'2016-07-05T10:18:21Z',
                    *                'originalTransactionIdentifier':'123412341234',
                    *                'webOrderLineItemID':-1497665198,
                    *                'cancellationDate':null}
                    *        ],
                    *        'bundleIdentifier': 'com.mycompany.myapp' }
                    */
                    var lastPurchase = {};
                    if (res.inAppPurchases && res.inAppPurchases.constructor === Array) {
                        res.inAppPurchases.forEach(function(inAppPurchase) {
                            
                            // filter out other productIds
                            if (inAppPurchase.productId === productId) {

                                // if 
                                if (!lastPurchase.subscriptionExpirationDate) {
                                    lastPurchase = inAppPurchase;
                                    return;
                                }

                                var lastExp = new Date(lastPurchase.subscriptionExpirationDate);
                                var currExp = new Date(inAppPurchase.subscriptionExpirationDate);

                                if (lastExp < currExp) {
                                    lastPurchase = inAppPurchase;
                                }
                            }
                        });
                    }

                    return lastPurchase;
                })
                .then(function(lastPurchase) {
                    // return expiration date

                    if (!lastPurchase.subscriptionExpirationDate) {
                        return null;
                    }
                    logModule.log('[IAPlight] getExpireDate lastPurchase ok', lastPurchase);

                    var dt = new Date(lastPurchase.subscriptionExpirationDate);
                    if (Object.prototype.toString.call(dt) === '[object Date]') {
                        // it is a date
                        if (isNaN(dt.getTime())) {
                            return null;
                        }
                    } else {
                        logModule.err('[IAPlight] getReceiptBundle invalid date: ' + lastPurchase.subscriptionExpirationDate + ' Date.toString:' + dt);
                        return null;
                    }
                    return dt;
                })
                .catch(function(error){
                    logModule.err('[IAPlight] getReceiptBundle KO: ' + error, error);
                    throw error;
                });
            };

            // wait for initPromise if it didn't complete
            return initPromise.then(receiptFunc);
        };

        protectedInterface.isSubscribed = function(productId) {
            
            if (initPromise === null) {
                return Promise.reject('Not initialized');
            }

            var isSubscribedFunc = function() {
                return protectedInterface.getActiveSubscriptionsInfo()
                .then(function(activeSubscriptions){

                    return Boolean(activeSubscriptions[productId]);
                });
            };

            // wait for initPromise if it didn't complete
            return initPromise.then(isSubscribedFunc);
        };

        protectedInterface.restore = function() {
            
            if (initPromise === null) {
                return Promise.reject('Not initialized');
            }

            var restoreFunc = function() {
                return window.inAppPurchase.restorePurchases()
                .then(function(resultRestore){
                    // resolves to an array of objects with the following attributes:
                    //   productId
                    //   state - the state of the product. On Android the statuses are: 0 - ACTIVE, 1 - CANCELLED, 2 - REFUNDED
                    //   transactionId
                    //   date - timestamp of the purchase
                    //   productType - On Android it can be used to consume a purchase. On iOS it will be an empty string.
                    //   receipt - On Android it can be used to consume a purchase. On iOS it will be an empty string.
                    //   signature - On Android it can be used to consume a purchase. On iOS it will be an empty string.


                    logModule.log('[IAPlight] restore restorePurchases ok', resultRestore);

                    /* resultRestore: [
                            {'productId':'com.mycompany.myproduct.weekly.v1','date':'2016-07-05T10:27:21Z','transactionId':'1000000222595453','state':3},
                            {'productId':'com.mycompany.myproduct.weekly.v1','date':'2016-07-05T10:21:21Z','transactionId':'1000000222595454','state':3},
                            {'productId':'com.mycompany.myproduct.weekly.v1','date':'2016-07-08T11:10:50Z','transactionId':'1000000222595466','state':3}
                        ]
                    */

                    return protectedInterface.getActiveSubscriptionsInfo()
                    .then(function(activeSubscriptions){
                        if (Object.keys(activeSubscriptions).length === 0) {
                            return false;
                        }
                        return activeSubscriptions;
                    });
                })
                .catch(function(error){
                    logModule.err('[IAPlight] restore restorePurchases KO: ' + error, error);
                    throw error;
                });
            };

            // wait for initPromise if it didn't complete
            return initPromise.then(restoreFunc);
        };

        protectedInterface.getProductInfo = function(productId) {
            
            if (initPromise === null) {
                return Promise.reject('Not initialized');
            }

            // wait for initPromise if it didn't complete
            return initPromise.then(function(){

                var rightProductInfo = {};

                productsInfo.forEach(function(productInfo) {
                    if (productInfo.productId === productId) {
                        rightProductInfo = productInfo;
                    }
                });
                logModule.log('[IAPlight] getProductInfo(): product found:', rightProductInfo);

                return rightProductInfo;
            });
        };

        /**
         * Check the validity and expiration of a date string
         * @param {String} date date in string to check validity of
         * @return {Boolean} validity of date string
         */
        var isValidDateAndNotExpired = function(dateString) {
            var dateDate = new Date(dateString);
            // it is a date... ?
            if (Object.prototype.toString.call(dateDate) === '[object Date]') {
                if (isNaN(dateDate.getTime())) {
                    // ...no!
                    return false;
                }
            } else {
                // ...no!
                logModule.err('[IAPlight] isValidDateAndNotExpired() invalid date: ' + dateString + ' Date.toString:' + dateDate);
                return false;
            }
            // ...yes!!

            // ... and not expired ...
            return ((dateDate !== null) && (new Date() < dateDate));
        };

        protectedInterface.getActiveSubscriptionsInfo = function() {
            
            if (initPromise === null) {
                return Promise.reject('Not initialized');
            }

            var activeSubscriptionsInfoFunc = function() {
                if (device.isRunningOnAndroid()) {

                    return window.inAppPurchase.restorePurchases()
                    .then(function(resultsRestore){

                        var activeSubscriptionInfo = {};
                        
                        // [
                        //    {
                        //        'productId':'pt.getstyle.weekly.v1',
                        //        'transactionId':'',
                        //        'type':'subs',
                        //        'productType':'subs',
                        //        'signature':'EjwaorJ8D5yD9F7t7yQgRvHBjk+Ga53seIilDuzzLmv05cc0LiV/WAqUE+NHq+CGTnogtxnb/rjSAxo+K2S6xg8kskZQvRzYNxo0YBhvhCRr5VKrvQO+VZTwM3RKfNlDGdCYw7rEuuvcvH733wzPGdeKmLKw4JI7wk6ViVMEgq7ub7dOTwiv8rSVqf/2sIbD96yhh3d55jWiBdbwCzLvaVcLKTAD6oG78bW7n9FbTAcdDEMxAeNEDJw90fANA/MXvvO1tp6rcFy/emqDCZcinv+zal5rQQc7M372YW6iBqWWm+zemexH6DrVsdjdGEsI6X1Rmk8Y8M1bnwnYKCACaA==',
                        //        'receipt': '{ \'packageName\':\'pt.getstyle\',
                        //                      \'productId\':\'pt.getstyle.weekly.v1\',
                        //                      \'purchaseTime\':1490946081110,
                        //                      \'purchaseState\':0,
                        //                      \'purchaseToken\':\'gjmkkfbapgplpdallcgpbaol.AO-J1OxwQeGM0H3ru88F1BVqSYtUT-4VsS3U9a0tlWomLk7kvvpNQoMlAVX3_mZ2aiu5X50luuLSeO31QxwwldN9jczTU_H6UMkD1tq1hLILWE1-nAkq9VrOpoW0Jz4rbQnUwZHb_wwZ\',
                        //                      \'autoRenewing\':true
                        //                  }'
                        //    }
                        // ]

                        if (resultsRestore && resultsRestore.constructor === Array) {
                            resultsRestore.forEach(function(resultRestore) {
                                    
                                var parsedReceipt = JSON.parse(resultRestore.receipt);
                                if ((parsedReceipt.packageName === appPackageName) &&
                                    (parsedReceipt.purchaseState === 0)) {
                                    
                                    activeSubscriptionInfo[resultRestore.productId] = parsedReceipt;
                                }
                            });
                        }
                        return activeSubscriptionInfo;
                    });

                } else if (device.isRunningOnIos()) {
                    
                    return window.inAppPurchase.getReceiptBundle()
                    .then(function(res){
                        // get last purchase receipt (ordered by last subscriptionExpirationDate) for each active product

                        var activeSubscriptionInfo = {};

                        logModule.log('[IAPlight] getActiveSubscriptionsInfo getReceiptBundle ok', res);

                        /* res:{ 'originalAppVersion': '1.0',
                        *        'appVersion': '0.1.0',
                        *        'inAppPurchases': [ {
                        *                'transactionIdentifier':'123412341234',
                        *                'quantity':1,
                        *                'purchaseDate':'2016-07-05T10:15:21Z',
                        *                'productId':'com.mycompany.myapp.weekly.v1',
                        *                'originalPurchaseDate':'2016-07-05T10:15:22Z',
                        *                'subscriptionExpirationDate':'2016-07-05T10:18:21Z',
                        *                'originalTransactionIdentifier':'123412341234',
                        *                'webOrderLineItemID':-1497665198,
                        *                'cancellationDate':null}
                        *        ],
                        *        'bundleIdentifier': 'com.mycompany.myapp' }
                        */
                        if (res.inAppPurchases && res.inAppPurchases.constructor === Array) {

                            res.inAppPurchases.forEach(function(inAppPurchase) {
                                
                                // continue only if subscriptionExpirationDate is valid...
                                if (isValidDateAndNotExpired(inAppPurchase.subscriptionExpirationDate)) {

                                    // if not existent ...
                                    if (!(inAppPurchase.productId in activeSubscriptionInfo)) {
                                        
                                        // ... save it
                                        activeSubscriptionInfo[inAppPurchase.productId] = inAppPurchase;
                                        return;
                                    }

                                    // if expire later...
                                    var lastExp = new Date(activeSubscriptionInfo[inAppPurchase.productId].subscriptionExpirationDate);
                                    var currExp = new Date(inAppPurchase.subscriptionExpirationDate);

                                    if (lastExp < currExp) {
                                        // ... save it
                                        activeSubscriptionInfo[inAppPurchase.productId] = inAppPurchase;
                                    }
                                }
                            });
                        }

                        return activeSubscriptionInfo;
                    })
                    .catch(function(error){
                        logModule.err('[IAPlight] getReceiptBundle KO: ' + error, error);
                        throw error;
                    });

                } else {
                    return Promise.reject('Unsupported platform!');
                }
            };

            // wait for initPromise if it didn't complete
            return initPromise.then(activeSubscriptionsInfoFunc);
        };

        protectedInterface.__clean__ = function() {
            initPromise = null;
        };
        
        protectedInterface.name = function() {
            return 'iaplight';
        };

        return protectedInterface;
    }()
);

module.exports = iaplight;
