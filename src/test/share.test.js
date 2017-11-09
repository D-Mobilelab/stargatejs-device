var Promise = require('promise-polyfill');

var share = require("../share");
var Mock = require('../../test/mock');


describe("Stargate share", function() {
    
    beforeEach(function() {
		
		Mock.cookie_mock.val.hybrid = 1;
		window.Cookies = Mock.cookie_mock;

		window.device = Mock.spec_device_mock;
		window.hostedwebapp = Mock.hostedwebapp_mock;
		window.cordova = Mock.cordova_mock;
		window.StatusBar = Mock.statusbar_mock;
		navigator.splashscreen = Mock.navigator_splashscreen_mock;
        navigator.connection = Mock.navigator_connection_mock;
		
		log = jasmine.createSpy();

		getManifest = function(){
			return Promise.resolve(Mock.manifest_mock);
		};

        //document.removeEventListener("deviceready",onDeviceReady, false);
        
        if (!window.plugins) {
            window.plugins = {};
        }
        window.plugins.socialsharing = {
            shareWithOptions: function(options, onSuccess, onError) {
                onSuccess(true);
            },
            shareViaFacebook: function(msg, img, url, onSuccess, onError) {
                onSuccess(true);
            },
            shareViaTwitter: function(msg, img, url, onSuccess, onError) {
                onSuccess(true);
            },
            shareViaWhatsApp: function(msg, img, url, onSuccess, onError) {
                onSuccess(true);
            },
            canShareVia: function(via, message, subject, fileOrFileArray, url, onSuccess, onError) {
                //onError();
				onSuccess(true);
            }
        };
    });
    
    it("socialShare invalid parameters 1", function(done) {
		
        var options = false;

		var res = share.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeDefined();
		    done();
		});
    });

    it("socialShare invalid parameters 2", function(done) {
		
        var options = {
			"url": "http://www.google.com",
			"type": "notexistent"
		};

		var res = share.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeDefined();
		    done();
		});
    });

    it("socialShare shareViaFacebook invalid plugin", function(done) {
        
        delete window.plugins.socialsharing;

        var options = {
			"url": "http://www.google.com",
			"type": "notexistent"
		};

		var res = share.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeDefined();
		    done();
		});
    });

    it("socialShare shareViaFacebook error from plugin", function(done) {
        
        window.plugins.socialsharing.shareViaFacebook = function(msg, img, url, onSuccess, onError) {
            onError("error");
        };
        
        var options = {
			"url": "http://www.google.com",
			"type": "notexistent"
		};

		var res = share.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeDefined();
		    done();
		});
    });
    
    
	it("socialShare shareViaFacebook", function(done) {
		
        var options = {
			"url": "http://www.google.com",
			"type": "facebook"
		};

		var res = share.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeFalsy();
		    done();
		});
	});
	
	it("socialShare shareWithTwitter", function(done) {
		
        var options = {
			"url": "http://www.google.com",
			"type": "twitter"
		};

		var res = share.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeFalsy();
		    done();
		});
	});
	
	it("socialShare shareWithWhatsapp", function(done) {
		
        var options = {
			"url": "http://www.google.com",
			"type": "whatsapp"
		};

		var res = share.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeFalsy();
		    done();
		});
	});
	
	it("socialShare shareWithChooser", function(done) {
		
        var options = {
			"url": "http://www.google.com",
			"type": "chooser"
		};

		var res = share.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeFalsy();
		    done();
		});
    });
    
    it("socialShare shareWithChooser error 1", function(done) {
        
        window.plugins.socialsharing.shareWithOptions = function(options, onSuccess, onError) {
            onError();
        };

        var options = {
			"url": "http://www.google.com",
            "type": "chooser",
            "message": "test message"
		};

		var res = share.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeFalsy();
		    done();
		});
    });
    
    it("socialShare shareWithFacebook error 1", function(done) {
        
        window.plugins.socialsharing.shareViaFacebook = function(msg, img, url, onSuccess, onError) {
            onError();
        };

        var options = {
            "url": "http://www.google.com",
            "message": "test message",
			"type": "facebook"
		};

		var res = share.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeFalsy();
		    done();
		});
    });
    
    it("socialShare shareWithTwitter error 1", function(done) {
        
        window.plugins.socialsharing.shareViaTwitter = function(msg, img, url, onSuccess, onError) {
            onError();
        };

        var options = {
            "url": "http://www.google.com",
            "message": "test message",
			"type": "twitter"
		};

		var res = share.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeFalsy();
		    done();
		});
    });
    
    it("socialShare shareViaWhatsApp error 1", function(done) {
        
        window.plugins.socialsharing.shareViaWhatsApp = function(msg, img, url, onSuccess, onError) {
            onError();
        };

        var options = {
            "url": "http://www.google.com",
            "message": "test message",
			"type": "whatsapp"
		};

		var res = share.socialShare(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShare catch: "+result);
            expect(result).not.toBeFalsy();
		    done();
		});
	});
	
	
	
	it("socialShare socialShareAvailable parameter error", function(done) {
		
        var options = {
			"url": "http://www.google.com",
			"socials": "invalidparam"
		};

		var res = share.socialShareAvailable(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			//console.log("stargatePublic.socialShare catch: "+message);
            expect(message).toMatch(/missing object parameter socials/);
		    done();
		});
	});
	
	it("socialShare socialShareAvailable", function(done) {
		
        var options = {
			"url": "http://www.google.com",
			"socials": {
				"facebook": true,
				"twitter": true,
				"instagram": false
			}
		};
		var expectedResult = {};
		for (var key in options.socials) {
			if (options.socials[key]) {
				expectedResult[key] = true;
			}
		}
		var res = share.socialShareAvailable(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShareAvailable result: "+result);
            expect(result).not.toBeFalsy();
            expect(result).toEqual(expectedResult);
		    done();
		});
	});

    it("socialShare socialShareAvailable error 1", function(done) {
        
        delete window.plugins.socialsharing;
        
        var options = {
			"url": "http://www.google.com",
			"socials": {
				"facebook": true,
				"twitter": true,
				"instagram": false
			}
		};
		var expectedResult = {};
		for (var key in options.socials) {
			if (options.socials[key]) {
				expectedResult[key] = true;
			}
		}
		var res = share.socialShareAvailable(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShareAvailable result: "+result);
            expect(result).not.toBeDefined();
		    done();
		});
	});

    it("socialShare socialShareAvailable error 2", function(done) {
        
        var options = {
			"socials": {
				"facebook": true,
				"twitter": true,
				"instagram": false
			}
		};
		var expectedResult = {};
		for (var key in options.socials) {
			if (options.socials[key]) {
				expectedResult[key] = true;
			}
		}
		var res = share.socialShareAvailable(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShareAvailable result: "+result);
            expect(result).not.toBeDefined();
		    done();
		});
	});

    it("socialShare socialShareAvailable error 3", function(done) {
        
        window.plugins.socialsharing.canShareVia = function(via, message, subject, fileOrFileArray, url, onSuccess, onError) {
            throw new Error("Test error");
        }

        var options = {
            "url": "http://www.google.com",            
			"socials": {
				"facebook": true,
				"twitter": true,
				"instagram": false
			}
		};
		var expectedResult = {};
		for (var key in options.socials) {
			if (options.socials[key]) {
				expectedResult[key] = true;
			}
		}
		var res = share.socialShareAvailable(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShareAvailable result: "+result);
            expect(result).not.toBeDefined();
		    done();
		});
    });
    
    it("socialShare socialShareAvailable error 4", function(done) {
        
        window.device.platform = 'Android';
        window.plugins.socialsharing.canShareVia = function(via, message, subject, fileOrFileArray, url, onSuccess, onError) {
            onError();
        }

        var options = {
            "url": "http://www.google.com",            
			"socials": {
				"facebook": true,
				"twitter": false,
				"instagram": true
			}
		};
		var expectedResult = {};
		for (var key in options.socials) {
			if (options.socials[key]) {
				expectedResult[key] = true;
			}
		}
		var res = share.socialShareAvailable(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).not.toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShareAvailable result: "+result);
            expect(result).toBeDefined();
		    done();
		});
    });
    
    it("socialShare socialShareAvailable error 5", function(done) {
        
        window.plugins.socialsharing.canShareVia = function(via, message, subject, fileOrFileArray, url, onSuccess, onError) {
            throw new Error("Test error");
        }

        var options = {
            "url": "http://www.google.com",            
			"socials": {
				"facebook": true,
				"twitter": true,
                "instagram": true,
                "whatsapp": true,
			}
		};
		var expectedResult = {};
		for (var key in options.socials) {
			if (options.socials[key]) {
				expectedResult[key] = true;
			}
		}
		var res = share.socialShareAvailable(options);
        
        expect(res.then).toBeDefined();
        
		res.catch(function(message) {
			console.log("stargatePublic.socialShare catch: "+message);
            expect(message).toBeDefined();
		    done();
		});
		
		res.then(function(result) {
			//console.log("stargatePublic.socialShareAvailable result: "+result);
            expect(result).not.toBeDefined();
		    done();
		});
    });
    

});