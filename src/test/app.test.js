var Promise = require('promise-polyfill');

var app = require("../app");
var packageJson = require('../../package.json');

var Mock = require('../../test/mock');


describe("Stargate app", function() {
    
    beforeEach(function() {
		
		window.device = Object.assign({}, Mock.spec_device_mock);
        window.cordova = Object.assign({}, Mock.cordova_mock);
		window.StatusBar = Object.assign({}, Mock.statusbar_mock);
		window.navigator.splashscreen = Object.assign({}, Mock.navigator_splashscreen_mock);
        window.navigator.connection = Object.assign({}, Mock.navigator_connection_mock);
    });
    
    it("app openUrl no plugin", function(done) {
        
        window.cordova.InAppBrowser = undefined;

		var res = app.openUrl('http://www.google.com');
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("app.openUrl catch: "+message);
            expect(message).toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeDefined();
		    done();
		});
    });

    it("app openUrl ", function(done) {
		
		var res = app.openUrl('http://www.google.com');
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("app.openUrl catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toBeDefined();
		    done();
		});
    });

    it("app isHybrid no", function() {
		var mockWindow = {
            location: {
                protocol: 'http',
                search: ''
            },
            document: {
                cookie: ''
            }
        };

		var res = app.isHybrid(mockWindow);
        
        expect(res).toBe(false);
    });

    it("app isHybrid file", function() {
        var mockWindow = {
            location: {
                protocol: 'file'
            },
            document: {
                cookie: ''
            }
        };
        
		var res = app.isHybrid(mockWindow);
        
        expect(res).toBe(true);
    });

    it("app isHybrid query", function() {
		var mockWindow = {
            location: {
                protocol: 'http',
                search: '?hybrid=1'
            },
            document: {
                cookie: ''
            }
        };

		var res = app.isHybrid(mockWindow);
        
        expect(res).toBe(true);
    });

    it("app isHybrid cookie", function() {
        var mockWindow = {
            location: {
                protocol: 'http',
                search: ''
            },
            document: {
                cookie: '; hybrid=1'
            }
        };
        var res = app.isHybrid(mockWindow);
        
        expect(res).toBe(true);
    });

    it("app isHybrid no cookie", function() {
        var mockWindow = {
            location: {
                protocol: 'http',
                search: ''
            },
            document: {
                cookie: '; nohybrid=1; '
            }
        };
        var res = app.isHybrid(mockWindow);
        
        expect(res).toBe(false);
    });

    it("app isHybrid no cookie 2", function() {
        var mockWindow = {
            location: {
                protocol: 'http',
                search: ''
            },
            document: {
                cookie: 'nohybrid=1; hybrid=1'
            }
        };
        var res = app.isHybrid(mockWindow);
        
        expect(res).toBe(true);
    });

    it("app no plugin 1", function(done) {
        
        window.cordova.getAppVersion = undefined;

        var res = app.getDeviceID();
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("app.getDeviceID catch: "+message);
            expect(message).toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeDefined();
		    done();
		});
    });

    it("app no plugin 2", function(done) {
        
        spyOn(app.testObject, 'getConnection').and.returnValue(undefined);

        var res = app.getDeviceID();
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("app.getDeviceID catch: "+message);
            expect(message).toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeDefined();
		    done();
		});
    });

    it("app no plugin 3", function(done) {
        var saveit = window.device;
        window.device = undefined;

        var res = app.getDeviceID();
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("app.getDeviceID catch: "+message);
            expect(message).toBeDefined();
            window.device = saveit;
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeDefined();
            window.device = saveit;
		    done();
		});
    });

    it("app getDeviceID", function(done) {
        var res = app.getDeviceID();
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("app.getDeviceID catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toEqual(Mock.spec_device_mock.uuid);
		    done();
		});
    });

    it("app getInformation", function(done) {
        var res = app.getInformation();
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("app.getDeviceID catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toBeDefined();
		    done();
		});
    });

    it("app getVersion", function(done) {
        var res = app.getVersion();
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("app.getVersion catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).toEqual(packageJson.version);
		    done();
		});
    });

});