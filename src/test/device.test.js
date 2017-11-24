var Promise = require('promise-polyfill');

var device = require('../device');
var Mock = require('../../test/mock');
var MockDevice = require('../../test/mocks/cordovafile/index');

describe("Device Module", function() {

    beforeEach(function() {
        window.device = Mock.spec_device_mock;
        window.cordova = Mock.cordova_mock;
        window.Connection = Mock.Connection;
		window.StatusBar = Mock.statusbar_mock;
		navigator.splashscreen = Mock.navigator_splashscreen_mock;
        navigator.connection = Mock.navigator_connection_mock;
        MockDevice.attachToWindow();
    });

    it("device isRunningOnAndroid", function() {
        window.device.platform = 'Android';

        var result = device.isRunningOnAndroid();
        var resultNo = device.isRunningOnIos();

        expect(result).toBe(true);
        expect(resultNo).toBe(false);
    });

    it("device isRunningOnIos", function() {
        window.device.platform = 'iOS';

        var result = device.isRunningOnIos();
        var resultNo = device.isRunningOnAndroid();

        expect(result).toBe(true);
        expect(resultNo).toBe(false);
    });

    it("device applicationStorage iOS", function() {
        window.device.platform = 'iOS';

        var expected = 'file:///data/data/io.cordova.hellocordova/Documents/';
        var result = device.applicationStorage();

        expect(result).toBe(expected);
    });

    it("device applicationStorage Android", function() {
        window.device.platform = 'Android';

        var expected = 'file:///data/data/io.cordova.hellocordova/';
        var result = device.applicationStorage();

        expect(result).toBe(expected);
    });

    it("initHybridApp error parameters 1", function(done) {

        var res = device.initHybridApp();

        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("initHybridApp catch: "+message);
            expect(message).toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeDefined();
		    done();
		});
    });

    it("initHybridApp error parameters 2", function(done) {
        
        var res = device.initHybridApp({
        });

        expect(res.then).toBeDefined();
        
        res.catch(function(message) {
            console.log("initHybridApp catch: "+message);
            expect(message).toBeDefined();
            done();
        });
        
        res.then(function(result) {
            //console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeDefined();
            done();
        });
    });
        
    it("initHybridApp error parameters 3", function(done) {

        var res = device.initHybridApp({
            config: {}            
        });

        expect(res.then).toBeDefined();
        
        res.catch(function(message) {
            console.log("initHybridApp catch: "+message);
            expect(message).toBeDefined();
            done();
        });
        
        res.then(function(result) {
            //console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeDefined();
            done();
        });
    });

    it("initHybridApp error parameters 4", function(done) {
        
        var res = device.initHybridApp({
            config: {},            
            saveConfigCb: function(){}
        });

        expect(res.then).toBeDefined();
        
        res.catch(function(message) {
            console.log("initHybridApp catch: "+message);
            expect(message).toBeDefined();
            done();
        });
        
        res.then(function(result) {
            //console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeDefined();
            done();
        });
    });

    it("initHybridApp error parameters 5", function(done) {
        
        var res = device.initHybridApp({
            config: {},            
            saveConfigCb: function(){},
            saveDictionaryCb: function(){},
        });
        Mock.SimulateEvent("deviceready", [], 300);

        expect(res.then).toBeDefined();
        
        res.catch(function(message) {
            console.log("initHybridApp catch: "+message);
            expect(message).toBeDefined();
            done();
        });
        
        res.then(function(result) {
            //console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeDefined();
            done();
        });
    });
});