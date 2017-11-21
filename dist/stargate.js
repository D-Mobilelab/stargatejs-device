(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Stargate"] = factory();
	else
		root["Stargate"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(1);
	var device = __webpack_require__(5);
	var iaplight = __webpack_require__(34);
	var share = __webpack_require__(35);
	var codepush = __webpack_require__(36);
	var statusbar = __webpack_require__(38);
	var logModule = __webpack_require__(33);
	var app = __webpack_require__(39);


	/**
	 * StargateJS Web interface
	 * @namespace Stargate
	 * @global
	 */

	module.exports = new function(){

	    this.device = device;

	    this.iaplight = iaplight;

	    this.share = share;

	    this.statusbar = statusbar;
	    
	    this.app = app;
	};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate) {(function (root) {

	  // Store setTimeout reference so promise-polyfill will be unaffected by
	  // other code modifying setTimeout (like sinon.useFakeTimers())
	  var setTimeoutFunc = setTimeout;

	  function noop() {}
	  
	  // Polyfill for Function.prototype.bind
	  function bind(fn, thisArg) {
	    return function () {
	      fn.apply(thisArg, arguments);
	    };
	  }

	  function Promise(fn) {
	    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
	    if (typeof fn !== 'function') throw new TypeError('not a function');
	    this._state = 0;
	    this._handled = false;
	    this._value = undefined;
	    this._deferreds = [];

	    doResolve(fn, this);
	  }

	  function handle(self, deferred) {
	    while (self._state === 3) {
	      self = self._value;
	    }
	    if (self._state === 0) {
	      self._deferreds.push(deferred);
	      return;
	    }
	    self._handled = true;
	    Promise._immediateFn(function () {
	      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
	      if (cb === null) {
	        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
	        return;
	      }
	      var ret;
	      try {
	        ret = cb(self._value);
	      } catch (e) {
	        reject(deferred.promise, e);
	        return;
	      }
	      resolve(deferred.promise, ret);
	    });
	  }

	  function resolve(self, newValue) {
	    try {
	      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
	      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
	      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
	        var then = newValue.then;
	        if (newValue instanceof Promise) {
	          self._state = 3;
	          self._value = newValue;
	          finale(self);
	          return;
	        } else if (typeof then === 'function') {
	          doResolve(bind(then, newValue), self);
	          return;
	        }
	      }
	      self._state = 1;
	      self._value = newValue;
	      finale(self);
	    } catch (e) {
	      reject(self, e);
	    }
	  }

	  function reject(self, newValue) {
	    self._state = 2;
	    self._value = newValue;
	    finale(self);
	  }

	  function finale(self) {
	    if (self._state === 2 && self._deferreds.length === 0) {
	      Promise._immediateFn(function() {
	        if (!self._handled) {
	          Promise._unhandledRejectionFn(self._value);
	        }
	      });
	    }

	    for (var i = 0, len = self._deferreds.length; i < len; i++) {
	      handle(self, self._deferreds[i]);
	    }
	    self._deferreds = null;
	  }

	  function Handler(onFulfilled, onRejected, promise) {
	    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
	    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
	    this.promise = promise;
	  }

	  /**
	   * Take a potentially misbehaving resolver function and make sure
	   * onFulfilled and onRejected are only called once.
	   *
	   * Makes no guarantees about asynchrony.
	   */
	  function doResolve(fn, self) {
	    var done = false;
	    try {
	      fn(function (value) {
	        if (done) return;
	        done = true;
	        resolve(self, value);
	      }, function (reason) {
	        if (done) return;
	        done = true;
	        reject(self, reason);
	      });
	    } catch (ex) {
	      if (done) return;
	      done = true;
	      reject(self, ex);
	    }
	  }

	  Promise.prototype['catch'] = function (onRejected) {
	    return this.then(null, onRejected);
	  };

	  Promise.prototype.then = function (onFulfilled, onRejected) {
	    var prom = new (this.constructor)(noop);

	    handle(this, new Handler(onFulfilled, onRejected, prom));
	    return prom;
	  };

	  Promise.all = function (arr) {
	    var args = Array.prototype.slice.call(arr);

	    return new Promise(function (resolve, reject) {
	      if (args.length === 0) return resolve([]);
	      var remaining = args.length;

	      function res(i, val) {
	        try {
	          if (val && (typeof val === 'object' || typeof val === 'function')) {
	            var then = val.then;
	            if (typeof then === 'function') {
	              then.call(val, function (val) {
	                res(i, val);
	              }, reject);
	              return;
	            }
	          }
	          args[i] = val;
	          if (--remaining === 0) {
	            resolve(args);
	          }
	        } catch (ex) {
	          reject(ex);
	        }
	      }

	      for (var i = 0; i < args.length; i++) {
	        res(i, args[i]);
	      }
	    });
	  };

	  Promise.resolve = function (value) {
	    if (value && typeof value === 'object' && value.constructor === Promise) {
	      return value;
	    }

	    return new Promise(function (resolve) {
	      resolve(value);
	    });
	  };

	  Promise.reject = function (value) {
	    return new Promise(function (resolve, reject) {
	      reject(value);
	    });
	  };

	  Promise.race = function (values) {
	    return new Promise(function (resolve, reject) {
	      for (var i = 0, len = values.length; i < len; i++) {
	        values[i].then(resolve, reject);
	      }
	    });
	  };

	  // Use polyfill for setImmediate for performance gains
	  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
	    function (fn) {
	      setTimeoutFunc(fn, 0);
	    };

	  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
	    if (typeof console !== 'undefined' && console) {
	      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
	    }
	  };

	  /**
	   * Set the immediate function to execute callbacks
	   * @param fn {function} Function to execute
	   * @deprecated
	   */
	  Promise._setImmediateFn = function _setImmediateFn(fn) {
	    Promise._immediateFn = fn;
	  };

	  /**
	   * Change the function to execute on unhandled rejection
	   * @param {function} fn Function to execute on unhandled rejection
	   * @deprecated
	   */
	  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
	    Promise._unhandledRejectionFn = fn;
	  };
	  
	  if (typeof module !== 'undefined' && module.exports) {
	    module.exports = Promise;
	  } else if (!root.Promise) {
	    root.Promise = Promise;
	  }

	})(this);

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2).setImmediate))

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	var apply = Function.prototype.apply;

	// DOM APIs, for completeness

	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) {
	  if (timeout) {
	    timeout.close();
	  }
	};

	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};

	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};

	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};

	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);

	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};

	// setimmediate attaches itself to the global object
	__webpack_require__(3);
	exports.setImmediate = setImmediate;
	exports.clearImmediate = clearImmediate;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
	    "use strict";

	    if (global.setImmediate) {
	        return;
	    }

	    var nextHandle = 1; // Spec says greater than zero
	    var tasksByHandle = {};
	    var currentlyRunningATask = false;
	    var doc = global.document;
	    var registerImmediate;

	    function setImmediate(callback) {
	      // Callback can either be a function or a string
	      if (typeof callback !== "function") {
	        callback = new Function("" + callback);
	      }
	      // Copy function arguments
	      var args = new Array(arguments.length - 1);
	      for (var i = 0; i < args.length; i++) {
	          args[i] = arguments[i + 1];
	      }
	      // Store and register the task
	      var task = { callback: callback, args: args };
	      tasksByHandle[nextHandle] = task;
	      registerImmediate(nextHandle);
	      return nextHandle++;
	    }

	    function clearImmediate(handle) {
	        delete tasksByHandle[handle];
	    }

	    function run(task) {
	        var callback = task.callback;
	        var args = task.args;
	        switch (args.length) {
	        case 0:
	            callback();
	            break;
	        case 1:
	            callback(args[0]);
	            break;
	        case 2:
	            callback(args[0], args[1]);
	            break;
	        case 3:
	            callback(args[0], args[1], args[2]);
	            break;
	        default:
	            callback.apply(undefined, args);
	            break;
	        }
	    }

	    function runIfPresent(handle) {
	        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // "too much recursion" error.
	            setTimeout(runIfPresent, 0, handle);
	        } else {
	            var task = tasksByHandle[handle];
	            if (task) {
	                currentlyRunningATask = true;
	                try {
	                    run(task);
	                } finally {
	                    clearImmediate(handle);
	                    currentlyRunningATask = false;
	                }
	            }
	        }
	    }

	    function installNextTickImplementation() {
	        registerImmediate = function(handle) {
	            process.nextTick(function () { runIfPresent(handle); });
	        };
	    }

	    function canUsePostMessage() {
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `global.postMessage` means something completely different and can't be used for this purpose.
	        if (global.postMessage && !global.importScripts) {
	            var postMessageIsAsynchronous = true;
	            var oldOnMessage = global.onmessage;
	            global.onmessage = function() {
	                postMessageIsAsynchronous = false;
	            };
	            global.postMessage("", "*");
	            global.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous;
	        }
	    }

	    function installPostMessageImplementation() {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

	        var messagePrefix = "setImmediate$" + Math.random() + "$";
	        var onGlobalMessage = function(event) {
	            if (event.source === global &&
	                typeof event.data === "string" &&
	                event.data.indexOf(messagePrefix) === 0) {
	                runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };

	        if (global.addEventListener) {
	            global.addEventListener("message", onGlobalMessage, false);
	        } else {
	            global.attachEvent("onmessage", onGlobalMessage);
	        }

	        registerImmediate = function(handle) {
	            global.postMessage(messagePrefix + handle, "*");
	        };
	    }

	    function installMessageChannelImplementation() {
	        var channel = new MessageChannel();
	        channel.port1.onmessage = function(event) {
	            var handle = event.data;
	            runIfPresent(handle);
	        };

	        registerImmediate = function(handle) {
	            channel.port2.postMessage(handle);
	        };
	    }

	    function installReadyStateChangeImplementation() {
	        var html = doc.documentElement;
	        registerImmediate = function(handle) {
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement("script");
	            script.onreadystatechange = function () {
	                runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	        };
	    }

	    function installSetTimeoutImplementation() {
	        registerImmediate = function(handle) {
	            setTimeout(runIfPresent, 0, handle);
	        };
	    }

	    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
	    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
	    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

	    // Don't get fooled by e.g. browserify environments.
	    if ({}.toString.call(global.process) === "[object process]") {
	        // For Node.js before 0.9
	        installNextTickImplementation();

	    } else if (canUsePostMessage()) {
	        // For non-IE10 modern browsers
	        installPostMessageImplementation();

	    } else if (global.MessageChannel) {
	        // For web workers, where supported
	        installMessageChannelImplementation();

	    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
	        // For IE 6–8
	        installReadyStateChangeImplementation();

	    } else {
	        // For older browsers
	        installSetTimeoutImplementation();
	    }

	    attachTo.setImmediate = setImmediate;
	    attachTo.clearImmediate = clearImmediate;
	}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(4)))

/***/ }),
/* 4 */
/***/ (function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;

	process.listeners = function (name) { return [] }

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	var axios = __webpack_require__(6);
	var Promise = __webpack_require__(1);

	var File = __webpack_require__(32);
	var logModule = __webpack_require__(33);

	var Device = {};

	var dictionaryFileName = 'dict.json';
	var configFileName = 'config.json';
	var statusFileName = 'status.json';
	var dictionariApi = '/v01/dictionary.getlist';

	// FIXME: this must be sent as a parameter
	var configApi = '/v01/config.getvars?keys=XXXXXFIXMEXXXX';

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
	Device.tempDirectory = function() {
	    return window.cordova.file.tempDirectory;
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

	Device.updateConfig = function(baseURL) {
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

	Device.updateCachedConfigs = function(baseURL) {
	    return Promise.all([
	        Device.updateDictionary(baseURL),
	        Device.updateConfig(baseURL)
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
	                    return Device.updateCachedConfigs(hostname)
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
	                Device.updateCachedConfigs(options.config.DEST_DOMAIN);

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

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(7);

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(8);
	var bind = __webpack_require__(9);
	var Axios = __webpack_require__(11);
	var defaults = __webpack_require__(12);

	/**
	 * Create an instance of Axios
	 *
	 * @param {Object} defaultConfig The default config for the instance
	 * @return {Axios} A new instance of Axios
	 */
	function createInstance(defaultConfig) {
	  var context = new Axios(defaultConfig);
	  var instance = bind(Axios.prototype.request, context);

	  // Copy axios.prototype to instance
	  utils.extend(instance, Axios.prototype, context);

	  // Copy context to instance
	  utils.extend(instance, context);

	  return instance;
	}

	// Create the default instance to be exported
	var axios = createInstance(defaults);

	// Expose Axios class to allow class inheritance
	axios.Axios = Axios;

	// Factory for creating new instances
	axios.create = function create(instanceConfig) {
	  return createInstance(utils.merge(defaults, instanceConfig));
	};

	// Expose Cancel & CancelToken
	axios.Cancel = __webpack_require__(29);
	axios.CancelToken = __webpack_require__(30);
	axios.isCancel = __webpack_require__(26);

	// Expose all/spread
	axios.all = function all(promises) {
	  return Promise.all(promises);
	};
	axios.spread = __webpack_require__(31);

	module.exports = axios;

	// Allow use of default import syntax in TypeScript
	module.exports.default = axios;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var bind = __webpack_require__(9);
	var isBuffer = __webpack_require__(10);

	/*global toString:true*/

	// utils is a library of generic helper functions non-specific to axios

	var toString = Object.prototype.toString;

	/**
	 * Determine if a value is an Array
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Array, otherwise false
	 */
	function isArray(val) {
	  return toString.call(val) === '[object Array]';
	}

	/**
	 * Determine if a value is an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
	 */
	function isArrayBuffer(val) {
	  return toString.call(val) === '[object ArrayBuffer]';
	}

	/**
	 * Determine if a value is a FormData
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an FormData, otherwise false
	 */
	function isFormData(val) {
	  return (typeof FormData !== 'undefined') && (val instanceof FormData);
	}

	/**
	 * Determine if a value is a view on an ArrayBuffer
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
	 */
	function isArrayBufferView(val) {
	  var result;
	  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
	    result = ArrayBuffer.isView(val);
	  } else {
	    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
	  }
	  return result;
	}

	/**
	 * Determine if a value is a String
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a String, otherwise false
	 */
	function isString(val) {
	  return typeof val === 'string';
	}

	/**
	 * Determine if a value is a Number
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Number, otherwise false
	 */
	function isNumber(val) {
	  return typeof val === 'number';
	}

	/**
	 * Determine if a value is undefined
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if the value is undefined, otherwise false
	 */
	function isUndefined(val) {
	  return typeof val === 'undefined';
	}

	/**
	 * Determine if a value is an Object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is an Object, otherwise false
	 */
	function isObject(val) {
	  return val !== null && typeof val === 'object';
	}

	/**
	 * Determine if a value is a Date
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Date, otherwise false
	 */
	function isDate(val) {
	  return toString.call(val) === '[object Date]';
	}

	/**
	 * Determine if a value is a File
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a File, otherwise false
	 */
	function isFile(val) {
	  return toString.call(val) === '[object File]';
	}

	/**
	 * Determine if a value is a Blob
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Blob, otherwise false
	 */
	function isBlob(val) {
	  return toString.call(val) === '[object Blob]';
	}

	/**
	 * Determine if a value is a Function
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Function, otherwise false
	 */
	function isFunction(val) {
	  return toString.call(val) === '[object Function]';
	}

	/**
	 * Determine if a value is a Stream
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a Stream, otherwise false
	 */
	function isStream(val) {
	  return isObject(val) && isFunction(val.pipe);
	}

	/**
	 * Determine if a value is a URLSearchParams object
	 *
	 * @param {Object} val The value to test
	 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
	 */
	function isURLSearchParams(val) {
	  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
	}

	/**
	 * Trim excess whitespace off the beginning and end of a string
	 *
	 * @param {String} str The String to trim
	 * @returns {String} The String freed of excess whitespace
	 */
	function trim(str) {
	  return str.replace(/^\s*/, '').replace(/\s*$/, '');
	}

	/**
	 * Determine if we're running in a standard browser environment
	 *
	 * This allows axios to run in a web worker, and react-native.
	 * Both environments support XMLHttpRequest, but not fully standard globals.
	 *
	 * web workers:
	 *  typeof window -> undefined
	 *  typeof document -> undefined
	 *
	 * react-native:
	 *  navigator.product -> 'ReactNative'
	 */
	function isStandardBrowserEnv() {
	  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
	    return false;
	  }
	  return (
	    typeof window !== 'undefined' &&
	    typeof document !== 'undefined'
	  );
	}

	/**
	 * Iterate over an Array or an Object invoking a function for each item.
	 *
	 * If `obj` is an Array callback will be called passing
	 * the value, index, and complete array for each item.
	 *
	 * If 'obj' is an Object callback will be called passing
	 * the value, key, and complete object for each property.
	 *
	 * @param {Object|Array} obj The object to iterate
	 * @param {Function} fn The callback to invoke for each item
	 */
	function forEach(obj, fn) {
	  // Don't bother if no value provided
	  if (obj === null || typeof obj === 'undefined') {
	    return;
	  }

	  // Force an array if not already something iterable
	  if (typeof obj !== 'object' && !isArray(obj)) {
	    /*eslint no-param-reassign:0*/
	    obj = [obj];
	  }

	  if (isArray(obj)) {
	    // Iterate over array values
	    for (var i = 0, l = obj.length; i < l; i++) {
	      fn.call(null, obj[i], i, obj);
	    }
	  } else {
	    // Iterate over object keys
	    for (var key in obj) {
	      if (Object.prototype.hasOwnProperty.call(obj, key)) {
	        fn.call(null, obj[key], key, obj);
	      }
	    }
	  }
	}

	/**
	 * Accepts varargs expecting each argument to be an object, then
	 * immutably merges the properties of each object and returns result.
	 *
	 * When multiple objects contain the same key the later object in
	 * the arguments list will take precedence.
	 *
	 * Example:
	 *
	 * ```js
	 * var result = merge({foo: 123}, {foo: 456});
	 * console.log(result.foo); // outputs 456
	 * ```
	 *
	 * @param {Object} obj1 Object to merge
	 * @returns {Object} Result of all merge properties
	 */
	function merge(/* obj1, obj2, obj3, ... */) {
	  var result = {};
	  function assignValue(val, key) {
	    if (typeof result[key] === 'object' && typeof val === 'object') {
	      result[key] = merge(result[key], val);
	    } else {
	      result[key] = val;
	    }
	  }

	  for (var i = 0, l = arguments.length; i < l; i++) {
	    forEach(arguments[i], assignValue);
	  }
	  return result;
	}

	/**
	 * Extends object a by mutably adding to it the properties of object b.
	 *
	 * @param {Object} a The object to be extended
	 * @param {Object} b The object to copy properties from
	 * @param {Object} thisArg The object to bind function to
	 * @return {Object} The resulting value of object a
	 */
	function extend(a, b, thisArg) {
	  forEach(b, function assignValue(val, key) {
	    if (thisArg && typeof val === 'function') {
	      a[key] = bind(val, thisArg);
	    } else {
	      a[key] = val;
	    }
	  });
	  return a;
	}

	module.exports = {
	  isArray: isArray,
	  isArrayBuffer: isArrayBuffer,
	  isBuffer: isBuffer,
	  isFormData: isFormData,
	  isArrayBufferView: isArrayBufferView,
	  isString: isString,
	  isNumber: isNumber,
	  isObject: isObject,
	  isUndefined: isUndefined,
	  isDate: isDate,
	  isFile: isFile,
	  isBlob: isBlob,
	  isFunction: isFunction,
	  isStream: isStream,
	  isURLSearchParams: isURLSearchParams,
	  isStandardBrowserEnv: isStandardBrowserEnv,
	  forEach: forEach,
	  merge: merge,
	  extend: extend,
	  trim: trim
	};


/***/ }),
/* 9 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function bind(fn, thisArg) {
	  return function wrap() {
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    return fn.apply(thisArg, args);
	  };
	};


/***/ }),
/* 10 */
/***/ (function(module, exports) {

	/*!
	 * Determine if an object is a Buffer
	 *
	 * @author   Feross Aboukhadijeh <https://feross.org>
	 * @license  MIT
	 */

	// The _isBuffer check is for Safari 5-7 support, because it's missing
	// Object.prototype.constructor. Remove this eventually
	module.exports = function (obj) {
	  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
	}

	function isBuffer (obj) {
	  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
	}

	// For Node v0.10 support. Remove this eventually.
	function isSlowBuffer (obj) {
	  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
	}


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var defaults = __webpack_require__(12);
	var utils = __webpack_require__(8);
	var InterceptorManager = __webpack_require__(23);
	var dispatchRequest = __webpack_require__(24);
	var isAbsoluteURL = __webpack_require__(27);
	var combineURLs = __webpack_require__(28);

	/**
	 * Create a new instance of Axios
	 *
	 * @param {Object} instanceConfig The default config for the instance
	 */
	function Axios(instanceConfig) {
	  this.defaults = instanceConfig;
	  this.interceptors = {
	    request: new InterceptorManager(),
	    response: new InterceptorManager()
	  };
	}

	/**
	 * Dispatch a request
	 *
	 * @param {Object} config The config specific for this request (merged with this.defaults)
	 */
	Axios.prototype.request = function request(config) {
	  /*eslint no-param-reassign:0*/
	  // Allow for axios('example/url'[, config]) a la fetch API
	  if (typeof config === 'string') {
	    config = utils.merge({
	      url: arguments[0]
	    }, arguments[1]);
	  }

	  config = utils.merge(defaults, this.defaults, { method: 'get' }, config);
	  config.method = config.method.toLowerCase();

	  // Support baseURL config
	  if (config.baseURL && !isAbsoluteURL(config.url)) {
	    config.url = combineURLs(config.baseURL, config.url);
	  }

	  // Hook up interceptors middleware
	  var chain = [dispatchRequest, undefined];
	  var promise = Promise.resolve(config);

	  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
	    chain.unshift(interceptor.fulfilled, interceptor.rejected);
	  });

	  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
	    chain.push(interceptor.fulfilled, interceptor.rejected);
	  });

	  while (chain.length) {
	    promise = promise.then(chain.shift(), chain.shift());
	  }

	  return promise;
	};

	// Provide aliases for supported request methods
	utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url
	    }));
	  };
	});

	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  /*eslint func-names:0*/
	  Axios.prototype[method] = function(url, data, config) {
	    return this.request(utils.merge(config || {}, {
	      method: method,
	      url: url,
	      data: data
	    }));
	  };
	});

	module.exports = Axios;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var utils = __webpack_require__(8);
	var normalizeHeaderName = __webpack_require__(13);

	var DEFAULT_CONTENT_TYPE = {
	  'Content-Type': 'application/x-www-form-urlencoded'
	};

	function setContentTypeIfUnset(headers, value) {
	  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
	    headers['Content-Type'] = value;
	  }
	}

	function getDefaultAdapter() {
	  var adapter;
	  if (typeof XMLHttpRequest !== 'undefined') {
	    // For browsers use XHR adapter
	    adapter = __webpack_require__(14);
	  } else if (typeof process !== 'undefined') {
	    // For node use HTTP adapter
	    adapter = __webpack_require__(14);
	  }
	  return adapter;
	}

	var defaults = {
	  adapter: getDefaultAdapter(),

	  transformRequest: [function transformRequest(data, headers) {
	    normalizeHeaderName(headers, 'Content-Type');
	    if (utils.isFormData(data) ||
	      utils.isArrayBuffer(data) ||
	      utils.isBuffer(data) ||
	      utils.isStream(data) ||
	      utils.isFile(data) ||
	      utils.isBlob(data)
	    ) {
	      return data;
	    }
	    if (utils.isArrayBufferView(data)) {
	      return data.buffer;
	    }
	    if (utils.isURLSearchParams(data)) {
	      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
	      return data.toString();
	    }
	    if (utils.isObject(data)) {
	      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
	      return JSON.stringify(data);
	    }
	    return data;
	  }],

	  transformResponse: [function transformResponse(data) {
	    /*eslint no-param-reassign:0*/
	    if (typeof data === 'string') {
	      try {
	        data = JSON.parse(data);
	      } catch (e) { /* Ignore */ }
	    }
	    return data;
	  }],

	  timeout: 0,

	  xsrfCookieName: 'XSRF-TOKEN',
	  xsrfHeaderName: 'X-XSRF-TOKEN',

	  maxContentLength: -1,

	  validateStatus: function validateStatus(status) {
	    return status >= 200 && status < 300;
	  }
	};

	defaults.headers = {
	  common: {
	    'Accept': 'application/json, text/plain, */*'
	  }
	};

	utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
	  defaults.headers[method] = {};
	});

	utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
	  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
	});

	module.exports = defaults;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(8);

	module.exports = function normalizeHeaderName(headers, normalizedName) {
	  utils.forEach(headers, function processHeader(value, name) {
	    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
	      headers[normalizedName] = value;
	      delete headers[name];
	    }
	  });
	};


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';

	var utils = __webpack_require__(8);
	var settle = __webpack_require__(15);
	var buildURL = __webpack_require__(18);
	var parseHeaders = __webpack_require__(19);
	var isURLSameOrigin = __webpack_require__(20);
	var createError = __webpack_require__(16);
	var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || __webpack_require__(21);

	module.exports = function xhrAdapter(config) {
	  return new Promise(function dispatchXhrRequest(resolve, reject) {
	    var requestData = config.data;
	    var requestHeaders = config.headers;

	    if (utils.isFormData(requestData)) {
	      delete requestHeaders['Content-Type']; // Let the browser set it
	    }

	    var request = new XMLHttpRequest();
	    var loadEvent = 'onreadystatechange';
	    var xDomain = false;

	    // For IE 8/9 CORS support
	    // Only supports POST and GET calls and doesn't returns the response headers.
	    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
	    if (process.env.NODE_ENV !== 'test' &&
	        typeof window !== 'undefined' &&
	        window.XDomainRequest && !('withCredentials' in request) &&
	        !isURLSameOrigin(config.url)) {
	      request = new window.XDomainRequest();
	      loadEvent = 'onload';
	      xDomain = true;
	      request.onprogress = function handleProgress() {};
	      request.ontimeout = function handleTimeout() {};
	    }

	    // HTTP basic authentication
	    if (config.auth) {
	      var username = config.auth.username || '';
	      var password = config.auth.password || '';
	      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
	    }

	    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

	    // Set the request timeout in MS
	    request.timeout = config.timeout;

	    // Listen for ready state
	    request[loadEvent] = function handleLoad() {
	      if (!request || (request.readyState !== 4 && !xDomain)) {
	        return;
	      }

	      // The request errored out and we didn't get a response, this will be
	      // handled by onerror instead
	      // With one exception: request that using file: protocol, most browsers
	      // will return status as 0 even though it's a successful request
	      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
	        return;
	      }

	      // Prepare the response
	      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
	      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
	      var response = {
	        data: responseData,
	        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
	        status: request.status === 1223 ? 204 : request.status,
	        statusText: request.status === 1223 ? 'No Content' : request.statusText,
	        headers: responseHeaders,
	        config: config,
	        request: request
	      };

	      settle(resolve, reject, response);

	      // Clean up request
	      request = null;
	    };

	    // Handle low level network errors
	    request.onerror = function handleError() {
	      // Real errors are hidden from us by the browser
	      // onerror should only fire if it's a network error
	      reject(createError('Network Error', config, null, request));

	      // Clean up request
	      request = null;
	    };

	    // Handle timeout
	    request.ontimeout = function handleTimeout() {
	      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
	        request));

	      // Clean up request
	      request = null;
	    };

	    // Add xsrf header
	    // This is only done if running in a standard browser environment.
	    // Specifically not if we're in a web worker, or react-native.
	    if (utils.isStandardBrowserEnv()) {
	      var cookies = __webpack_require__(22);

	      // Add xsrf header
	      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
	          cookies.read(config.xsrfCookieName) :
	          undefined;

	      if (xsrfValue) {
	        requestHeaders[config.xsrfHeaderName] = xsrfValue;
	      }
	    }

	    // Add headers to the request
	    if ('setRequestHeader' in request) {
	      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
	        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
	          // Remove Content-Type if data is undefined
	          delete requestHeaders[key];
	        } else {
	          // Otherwise add header to the request
	          request.setRequestHeader(key, val);
	        }
	      });
	    }

	    // Add withCredentials to request if needed
	    if (config.withCredentials) {
	      request.withCredentials = true;
	    }

	    // Add responseType to request if needed
	    if (config.responseType) {
	      try {
	        request.responseType = config.responseType;
	      } catch (e) {
	        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
	        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
	        if (config.responseType !== 'json') {
	          throw e;
	        }
	      }
	    }

	    // Handle progress if needed
	    if (typeof config.onDownloadProgress === 'function') {
	      request.addEventListener('progress', config.onDownloadProgress);
	    }

	    // Not all browsers support upload events
	    if (typeof config.onUploadProgress === 'function' && request.upload) {
	      request.upload.addEventListener('progress', config.onUploadProgress);
	    }

	    if (config.cancelToken) {
	      // Handle cancellation
	      config.cancelToken.promise.then(function onCanceled(cancel) {
	        if (!request) {
	          return;
	        }

	        request.abort();
	        reject(cancel);
	        // Clean up request
	        request = null;
	      });
	    }

	    if (requestData === undefined) {
	      requestData = null;
	    }

	    // Send the request
	    request.send(requestData);
	  });
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var createError = __webpack_require__(16);

	/**
	 * Resolve or reject a Promise based on response status.
	 *
	 * @param {Function} resolve A function that resolves the promise.
	 * @param {Function} reject A function that rejects the promise.
	 * @param {object} response The response.
	 */
	module.exports = function settle(resolve, reject, response) {
	  var validateStatus = response.config.validateStatus;
	  // Note: status is not exposed by XDomainRequest
	  if (!response.status || !validateStatus || validateStatus(response.status)) {
	    resolve(response);
	  } else {
	    reject(createError(
	      'Request failed with status code ' + response.status,
	      response.config,
	      null,
	      response.request,
	      response
	    ));
	  }
	};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var enhanceError = __webpack_require__(17);

	/**
	 * Create an Error with the specified message, config, error code, request and response.
	 *
	 * @param {string} message The error message.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 * @param {Object} [request] The request.
	 * @param {Object} [response] The response.
	 * @returns {Error} The created error.
	 */
	module.exports = function createError(message, config, code, request, response) {
	  var error = new Error(message);
	  return enhanceError(error, config, code, request, response);
	};


/***/ }),
/* 17 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Update an Error with the specified config, error code, and response.
	 *
	 * @param {Error} error The error to update.
	 * @param {Object} config The config.
	 * @param {string} [code] The error code (for example, 'ECONNABORTED').
	 * @param {Object} [request] The request.
	 * @param {Object} [response] The response.
	 * @returns {Error} The error.
	 */
	module.exports = function enhanceError(error, config, code, request, response) {
	  error.config = config;
	  if (code) {
	    error.code = code;
	  }
	  error.request = request;
	  error.response = response;
	  return error;
	};


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(8);

	function encode(val) {
	  return encodeURIComponent(val).
	    replace(/%40/gi, '@').
	    replace(/%3A/gi, ':').
	    replace(/%24/g, '$').
	    replace(/%2C/gi, ',').
	    replace(/%20/g, '+').
	    replace(/%5B/gi, '[').
	    replace(/%5D/gi, ']');
	}

	/**
	 * Build a URL by appending params to the end
	 *
	 * @param {string} url The base of the url (e.g., http://www.google.com)
	 * @param {object} [params] The params to be appended
	 * @returns {string} The formatted url
	 */
	module.exports = function buildURL(url, params, paramsSerializer) {
	  /*eslint no-param-reassign:0*/
	  if (!params) {
	    return url;
	  }

	  var serializedParams;
	  if (paramsSerializer) {
	    serializedParams = paramsSerializer(params);
	  } else if (utils.isURLSearchParams(params)) {
	    serializedParams = params.toString();
	  } else {
	    var parts = [];

	    utils.forEach(params, function serialize(val, key) {
	      if (val === null || typeof val === 'undefined') {
	        return;
	      }

	      if (utils.isArray(val)) {
	        key = key + '[]';
	      }

	      if (!utils.isArray(val)) {
	        val = [val];
	      }

	      utils.forEach(val, function parseValue(v) {
	        if (utils.isDate(v)) {
	          v = v.toISOString();
	        } else if (utils.isObject(v)) {
	          v = JSON.stringify(v);
	        }
	        parts.push(encode(key) + '=' + encode(v));
	      });
	    });

	    serializedParams = parts.join('&');
	  }

	  if (serializedParams) {
	    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
	  }

	  return url;
	};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(8);

	/**
	 * Parse headers into an object
	 *
	 * ```
	 * Date: Wed, 27 Aug 2014 08:58:49 GMT
	 * Content-Type: application/json
	 * Connection: keep-alive
	 * Transfer-Encoding: chunked
	 * ```
	 *
	 * @param {String} headers Headers needing to be parsed
	 * @returns {Object} Headers parsed into an object
	 */
	module.exports = function parseHeaders(headers) {
	  var parsed = {};
	  var key;
	  var val;
	  var i;

	  if (!headers) { return parsed; }

	  utils.forEach(headers.split('\n'), function parser(line) {
	    i = line.indexOf(':');
	    key = utils.trim(line.substr(0, i)).toLowerCase();
	    val = utils.trim(line.substr(i + 1));

	    if (key) {
	      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
	    }
	  });

	  return parsed;
	};


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(8);

	module.exports = (
	  utils.isStandardBrowserEnv() ?

	  // Standard browser envs have full support of the APIs needed to test
	  // whether the request URL is of the same origin as current location.
	  (function standardBrowserEnv() {
	    var msie = /(msie|trident)/i.test(navigator.userAgent);
	    var urlParsingNode = document.createElement('a');
	    var originURL;

	    /**
	    * Parse a URL to discover it's components
	    *
	    * @param {String} url The URL to be parsed
	    * @returns {Object}
	    */
	    function resolveURL(url) {
	      var href = url;

	      if (msie) {
	        // IE needs attribute set twice to normalize properties
	        urlParsingNode.setAttribute('href', href);
	        href = urlParsingNode.href;
	      }

	      urlParsingNode.setAttribute('href', href);

	      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
	      return {
	        href: urlParsingNode.href,
	        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
	        host: urlParsingNode.host,
	        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
	        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
	        hostname: urlParsingNode.hostname,
	        port: urlParsingNode.port,
	        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
	                  urlParsingNode.pathname :
	                  '/' + urlParsingNode.pathname
	      };
	    }

	    originURL = resolveURL(window.location.href);

	    /**
	    * Determine if a URL shares the same origin as the current location
	    *
	    * @param {String} requestURL The URL to test
	    * @returns {boolean} True if URL shares the same origin, otherwise false
	    */
	    return function isURLSameOrigin(requestURL) {
	      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
	      return (parsed.protocol === originURL.protocol &&
	            parsed.host === originURL.host);
	    };
	  })() :

	  // Non standard browser envs (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return function isURLSameOrigin() {
	      return true;
	    };
	  })()
	);


/***/ }),
/* 21 */
/***/ (function(module, exports) {

	'use strict';

	// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

	function E() {
	  this.message = 'String contains an invalid character';
	}
	E.prototype = new Error;
	E.prototype.code = 5;
	E.prototype.name = 'InvalidCharacterError';

	function btoa(input) {
	  var str = String(input);
	  var output = '';
	  for (
	    // initialize result and counter
	    var block, charCode, idx = 0, map = chars;
	    // if the next str index does not exist:
	    //   change the mapping table to "="
	    //   check if d has no fractional digits
	    str.charAt(idx | 0) || (map = '=', idx % 1);
	    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
	    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
	  ) {
	    charCode = str.charCodeAt(idx += 3 / 4);
	    if (charCode > 0xFF) {
	      throw new E();
	    }
	    block = block << 8 | charCode;
	  }
	  return output;
	}

	module.exports = btoa;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(8);

	module.exports = (
	  utils.isStandardBrowserEnv() ?

	  // Standard browser envs support document.cookie
	  (function standardBrowserEnv() {
	    return {
	      write: function write(name, value, expires, path, domain, secure) {
	        var cookie = [];
	        cookie.push(name + '=' + encodeURIComponent(value));

	        if (utils.isNumber(expires)) {
	          cookie.push('expires=' + new Date(expires).toGMTString());
	        }

	        if (utils.isString(path)) {
	          cookie.push('path=' + path);
	        }

	        if (utils.isString(domain)) {
	          cookie.push('domain=' + domain);
	        }

	        if (secure === true) {
	          cookie.push('secure');
	        }

	        document.cookie = cookie.join('; ');
	      },

	      read: function read(name) {
	        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
	        return (match ? decodeURIComponent(match[3]) : null);
	      },

	      remove: function remove(name) {
	        this.write(name, '', Date.now() - 86400000);
	      }
	    };
	  })() :

	  // Non standard browser env (web workers, react-native) lack needed support.
	  (function nonStandardBrowserEnv() {
	    return {
	      write: function write() {},
	      read: function read() { return null; },
	      remove: function remove() {}
	    };
	  })()
	);


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(8);

	function InterceptorManager() {
	  this.handlers = [];
	}

	/**
	 * Add a new interceptor to the stack
	 *
	 * @param {Function} fulfilled The function to handle `then` for a `Promise`
	 * @param {Function} rejected The function to handle `reject` for a `Promise`
	 *
	 * @return {Number} An ID used to remove interceptor later
	 */
	InterceptorManager.prototype.use = function use(fulfilled, rejected) {
	  this.handlers.push({
	    fulfilled: fulfilled,
	    rejected: rejected
	  });
	  return this.handlers.length - 1;
	};

	/**
	 * Remove an interceptor from the stack
	 *
	 * @param {Number} id The ID that was returned by `use`
	 */
	InterceptorManager.prototype.eject = function eject(id) {
	  if (this.handlers[id]) {
	    this.handlers[id] = null;
	  }
	};

	/**
	 * Iterate over all the registered interceptors
	 *
	 * This method is particularly useful for skipping over any
	 * interceptors that may have become `null` calling `eject`.
	 *
	 * @param {Function} fn The function to call for each interceptor
	 */
	InterceptorManager.prototype.forEach = function forEach(fn) {
	  utils.forEach(this.handlers, function forEachHandler(h) {
	    if (h !== null) {
	      fn(h);
	    }
	  });
	};

	module.exports = InterceptorManager;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(8);
	var transformData = __webpack_require__(25);
	var isCancel = __webpack_require__(26);
	var defaults = __webpack_require__(12);

	/**
	 * Throws a `Cancel` if cancellation has been requested.
	 */
	function throwIfCancellationRequested(config) {
	  if (config.cancelToken) {
	    config.cancelToken.throwIfRequested();
	  }
	}

	/**
	 * Dispatch a request to the server using the configured adapter.
	 *
	 * @param {object} config The config that is to be used for the request
	 * @returns {Promise} The Promise to be fulfilled
	 */
	module.exports = function dispatchRequest(config) {
	  throwIfCancellationRequested(config);

	  // Ensure headers exist
	  config.headers = config.headers || {};

	  // Transform request data
	  config.data = transformData(
	    config.data,
	    config.headers,
	    config.transformRequest
	  );

	  // Flatten headers
	  config.headers = utils.merge(
	    config.headers.common || {},
	    config.headers[config.method] || {},
	    config.headers || {}
	  );

	  utils.forEach(
	    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
	    function cleanHeaderConfig(method) {
	      delete config.headers[method];
	    }
	  );

	  var adapter = config.adapter || defaults.adapter;

	  return adapter(config).then(function onAdapterResolution(response) {
	    throwIfCancellationRequested(config);

	    // Transform response data
	    response.data = transformData(
	      response.data,
	      response.headers,
	      config.transformResponse
	    );

	    return response;
	  }, function onAdapterRejection(reason) {
	    if (!isCancel(reason)) {
	      throwIfCancellationRequested(config);

	      // Transform response data
	      if (reason && reason.response) {
	        reason.response.data = transformData(
	          reason.response.data,
	          reason.response.headers,
	          config.transformResponse
	        );
	      }
	    }

	    return Promise.reject(reason);
	  });
	};


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(8);

	/**
	 * Transform the data for a request or a response
	 *
	 * @param {Object|String} data The data to be transformed
	 * @param {Array} headers The headers for the request or response
	 * @param {Array|Function} fns A single function or Array of functions
	 * @returns {*} The resulting transformed data
	 */
	module.exports = function transformData(data, headers, fns) {
	  /*eslint no-param-reassign:0*/
	  utils.forEach(fns, function transform(fn) {
	    data = fn(data, headers);
	  });

	  return data;
	};


/***/ }),
/* 26 */
/***/ (function(module, exports) {

	'use strict';

	module.exports = function isCancel(value) {
	  return !!(value && value.__CANCEL__);
	};


/***/ }),
/* 27 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Determines whether the specified URL is absolute
	 *
	 * @param {string} url The URL to test
	 * @returns {boolean} True if the specified URL is absolute, otherwise false
	 */
	module.exports = function isAbsoluteURL(url) {
	  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
	  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
	  // by any combination of letters, digits, plus, period, or hyphen.
	  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
	};


/***/ }),
/* 28 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Creates a new URL by combining the specified URLs
	 *
	 * @param {string} baseURL The base URL
	 * @param {string} relativeURL The relative URL
	 * @returns {string} The combined URL
	 */
	module.exports = function combineURLs(baseURL, relativeURL) {
	  return relativeURL
	    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
	    : baseURL;
	};


/***/ }),
/* 29 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * A `Cancel` is an object that is thrown when an operation is canceled.
	 *
	 * @class
	 * @param {string=} message The message.
	 */
	function Cancel(message) {
	  this.message = message;
	}

	Cancel.prototype.toString = function toString() {
	  return 'Cancel' + (this.message ? ': ' + this.message : '');
	};

	Cancel.prototype.__CANCEL__ = true;

	module.exports = Cancel;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var Cancel = __webpack_require__(29);

	/**
	 * A `CancelToken` is an object that can be used to request cancellation of an operation.
	 *
	 * @class
	 * @param {Function} executor The executor function.
	 */
	function CancelToken(executor) {
	  if (typeof executor !== 'function') {
	    throw new TypeError('executor must be a function.');
	  }

	  var resolvePromise;
	  this.promise = new Promise(function promiseExecutor(resolve) {
	    resolvePromise = resolve;
	  });

	  var token = this;
	  executor(function cancel(message) {
	    if (token.reason) {
	      // Cancellation has already been requested
	      return;
	    }

	    token.reason = new Cancel(message);
	    resolvePromise(token.reason);
	  });
	}

	/**
	 * Throws a `Cancel` if cancellation has been requested.
	 */
	CancelToken.prototype.throwIfRequested = function throwIfRequested() {
	  if (this.reason) {
	    throw this.reason;
	  }
	};

	/**
	 * Returns an object that contains a new `CancelToken` and a function that, when called,
	 * cancels the `CancelToken`.
	 */
	CancelToken.source = function source() {
	  var cancel;
	  var token = new CancelToken(function executor(c) {
	    cancel = c;
	  });
	  return {
	    token: token,
	    cancel: cancel
	  };
	};

	module.exports = CancelToken;


/***/ }),
/* 31 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Syntactic sugar for invoking a function and expanding an array for arguments.
	 *
	 * Common use case would be to use `Function.prototype.apply`.
	 *
	 *  ```js
	 *  function f(x, y, z) {}
	 *  var args = [1, 2, 3];
	 *  f.apply(null, args);
	 *  ```
	 *
	 * With `spread` this example can be re-written.
	 *
	 *  ```js
	 *  spread(function(x, y, z) {})([1, 2, 3]);
	 *  ```
	 *
	 * @param {Function} callback
	 * @returns {Function}
	 */
	module.exports = function spread(callback) {
	  return function wrap(arr) {
	    return callback.apply(null, arr);
	  };
	};


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(1);

	var File = {};

	/**
	 * _transform utils function
	 * @private
	 * @param {Array} entries - an array of Entry type object
	 * @returns {Array.<Object>} - an array of Object
	 * */
	function _transform(entries){
	    var arr = entries.map(function(entry){
	        return {
	            fullPath: entry.fullPath,
	            path: entry.toURL(),
	            internalURL: entry.toInternalURL(),
	            isFile: entry.isFile,
	            isDirectory: entry.isDirectory
	        };
	    });
	    return (arr.length === 1) ? arr[0] : arr;
	}

	/**
	 *  File.fileExists
	 *
	 *  @param {String} url - the toURL path to check
	 *  @returns {Promise<boolean|void>}
	 * */
	File.fileExists = function(url) {
	    return new Promise(function(resolve){
	        window.resolveLocalFileSystemURL(url, function(entry){
	            resolve(entry.isFile);
	        }, function(fileError){
	            resolve(fileError.code !== 1);
	        });
	    });
	};

	/**
	 * File.resolveFS
	 *
	 * @param {String} url - the path to load see cordova.file.*
	 * @returns {Promise<Entry|FileError>}
	 * */
	File.resolveFS = function(url){
	    return new Promise(function(resolve, reject){
	        window.resolveLocalFileSystemURL(url, resolve, reject);
	    });
	};

	/**
	 * File.readFile
	 *
	 * @param {String} filePath - the file entry to readAsText
	 * @returns {Promise<String|FileError>}
	 */
	File.readFile = function(filePath) {
	    return File.resolveFS(filePath)
	        .then(function(fileEntry){
	            return new Promise(function(resolve, reject){
	                fileEntry.file(function(file) {
	                    var reader = new FileReader();
	                    reader.onerror = reject;
	                    reader.onabort = reject;

	                    reader.onloadend = function() {
	                        var textToParse = this.result;
	                        resolve(textToParse);
	                    };
	                    reader.readAsText(file);
	                });
	            });
	        });
	};

	/**
	 * File.readFileAsJSON
	 * @param {String} indexPath - the path to the file to read
	 * @returns {Promise<Object|FileError>}
	 */
	File.readFileAsJSON = function(indexPath){
	    return File.readFile(indexPath)
	        .then(function(documentAsString){
	            try{
	                return Promise.resolve(window.JSON.parse(documentAsString));
	            }catch(e){
	                return Promise.reject(e);
	            }
	        });
	};

	/**
	 *  File.removeFile
	 *
	 *  @param {String} filePath - file://
	 *  @returns {Promise<String|FileError>}
	 * */
	File.removeFile = function(filePath){
	    return File.resolveFS(filePath)
	        .then(function(fileEntry){
	            return new Promise(function(resolve, reject){
	                fileEntry.remove(function(result){
	                    resolve(result === null || result === 'OK');
	                }, reject);
	            });
	        });
	};

	/**
	 * File.createFile
	 *
	 * @param {String} directory - filepath file:// like string
	 * @param {String} filename - the filename including the .txt
	 * @returns {Promise<FileEntry|FileError>}
	 * */
	File.createFile = function(directory, filename){
	    return File.resolveFS(directory)
	        .then(function(dirEntry){
	            return new Promise(function(resolve, reject){
	                dirEntry.getFile(filename, { create: true }, function(entry){
	                    resolve(_transform([entry]));
	                }, reject);
	            });
	        });
	};

	/**
	 * File.appendToFile
	 *
	 * @param {String} filePath - the filepath file:// url like
	 * @param {String|Blob} data - the string to write into the file
	 * @param {String} [overwrite=false] - overwrite
	 * @param {String} mimeType: text/plain | image/jpeg | image/png
	 * @returns {Promise<String|FileError>} where string is a filepath
	 */
	File.appendToFile = function(filePath, data, overwrite, mimeType){
	    // Default
	    overwrite = arguments[2] === undefined ? false : arguments[2];// eslint-disable-line prefer-rest-params
	    mimeType = arguments[3] === undefined ? 'text/plain' : arguments[3];// eslint-disable-line prefer-rest-params
	    return File.resolveFS(filePath)
	        .then(function(fileEntry){

	            return new Promise(function(resolve, reject){
	                fileEntry.createWriter(function(fileWriter) {
	                    if(!overwrite){
	                        fileWriter.seek(fileWriter.length);
	                    }

	                    var blob;
	                    if(!(data instanceof Blob)){
	                        blob = new Blob([data], { type: mimeType });
	                    }else{
	                        blob = data;
	                    }

	                    fileWriter.write(blob);
	                    fileWriter.onerror = reject;
	                    fileWriter.onabort = reject;
	                    fileWriter.onwriteend = function(){
	                        resolve(_transform([fileEntry]));
	                    };
	                }, reject);
	            });

	        });
	};

	/**
	 * write a file in the specified path and if not exists creates it
	 *
	 * @param {String} filepath - file:// path-like
	 * @param {String|Blob} content
	 * @returns {Promise<Object|FileError>}
	 * */
	File.write = function(filepath, content){
	    return File.fileExists(filepath).then(function(exists){
	        if(!exists){
	            var splitted = filepath.split('/');
	            
	            // this returns a new array and rejoin the path with /
	            var folder = splitted.slice(0, splitted.length - 1).join('/');
	            var filename = splitted[splitted.length - 1];

	            return File.createFile(folder, filename).then(function(entry){
	                return File.appendToFile(entry.path, content, true);                 
	            });
	        }
	        return File.appendToFile(filepath, content, true);
	    });
	};

	/**
	 * getMetadata from FileEntry or DirectoryEntry
	 * @param path {String} - the path string
	 * @returns {Promise<Object|FileError>}
	 */
	File.getMetadata = function(path){
	    return File.resolveFS(path)
	                .then(function(entry){
	                    return new Promise(function(resolve, reject){
	                        entry.getMetadata(resolve, reject);
	                    });                        
	                });
	};

	module.exports = File;


/***/ }),
/* 33 */
/***/ (function(module, exports) {

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

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(1);
	var device = __webpack_require__(5);
	var logModule = __webpack_require__(33);

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

	        protectedInterface.subscribeReceipt = function(productId) {
	            
	            if (initPromise === null) {
	                return Promise.reject('Not initialized');
	            }

	            var subFunc = function() {
	                return window.inAppPurchase.subscribe(
	                    productId
	                )
	                .then(function(res){
	                    logModule.log('[IAPlight] subscribeReceipt ok', res);
	                    return res;
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


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(1);
	var device = __webpack_require__(5);
	var logModule = __webpack_require__(33);


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



/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {var Promise = __webpack_require__(1);

	var logModule = __webpack_require__(33);


	/**
	 * 
	 * CODEPUSH Module
	 * 
	 * CodePush is a service that enable to update the app without passing by the Appstore/Google Play
	 * It consist in:
	 *  - a native part implemented as a cordova plugin that is avaliable here:
	 *    https://github.com/Microsoft/cordova-plugin-code-push
	 *  - a server that is given by Microsoft to store the binary updates, you can also use your server
	 *  - a CLI to manage the updates
	 *  - a client that is implemented here and that check for updates, demanding the codePush plugin
	 *    to download them and use them on next start of the application
	 * 
	 * Here the check for updates is done only on initialization of this module,
	 * but you can use a different policy.
	 * 
	 */

	var protectedInterface = {};

	var registeredCallbacks = {};

	var onSyncStatus = function(status) {
	    logModule.log('[CodePush] syncStatus: ' + 
	        protectedInterface.syncStatus[status]);
	    
	    if (registeredCallbacks[status] && Array === registeredCallbacks[status].constructor) {
	        registeredCallbacks[status].forEach(function(cb){
	            cb(status);
	        });
	    }
	};

	/**
	 * SyncStatus.UP_TO_DATE
	 * Result status - the application is up to date.
	 * 
	 * SyncStatus.UPDATE_INSTALLED
	 * Result status - an update is available, it has been downloaded, unzipped and copied to the deployment folder.
	 * After the completion of the callback invoked with SyncStatus.UPDATE_INSTALLED, the application will be reloaded with the updated code and resources.
	 *   
	 * SyncStatus.UPDATE_IGNORED
	 * Result status - an optional update is available, but the user declined to install it. The update was not downloaded.
	 * 
	 * SyncStatus.ERROR
	 * Result status - an error happened during the sync operation. This might be an error while communicating with the server, downloading or unziping the update.
	 * The console logs should contain more information about what happened. No update has been applied in this case.
	 * 
	 * SyncStatus.IN_PROGRESS
	 * Result status - there is an ongoing sync in progress, so this attempt to sync has been aborted.
	 * 
	 * SyncStatus.CHECKING_FOR_UPDATE
	 * Intermediate status - the plugin is about to check for updates.
	 * 
	 * SyncStatus.AWAITING_USER_ACTION
	 * Intermediate status - a user dialog is about to be displayed. This status will be reported only if user interaction is enabled.
	 * 
	 * SyncStatus.DOWNLOADING_PACKAGE
	 * Intermediate status - the update packages is about to be downloaded.
	 * 
	 * SyncStatus.INSTALLING_UPDATE
	 * Intermediate status - the update package is about to be installed.
	 */
	protectedInterface.syncStatus = {
	    0: 'UP_TO_DATE',
	    1: 'UPDATE_INSTALLED',
	    2: 'UPDATE_IGNORED',
	    3: 'ERROR',
	    4: 'IN_PROGRESS',
	    5: 'CHECKING_FOR_UPDATE',
	    6: 'AWAITING_USER_ACTION',
	    7: 'DOWNLOADING_PACKAGE',
	    8: 'INSTALLING_UPDATE',
	    AWAITING_USER_ACTION: 6,
	    CHECKING_FOR_UPDATE: 5,
	    DOWNLOADING_PACKAGE: 7,
	    ERROR: 3,
	    INSTALLING_UPDATE: 8,
	    IN_PROGRESS: 4,
	    UPDATE_IGNORED: 2,
	    UPDATE_INSTALLED: 1,
	    UP_TO_DATE: 0
	};

	protectedInterface.registerForNotification = function(status, callback) {
	    if (!status) {
	        logModule.err('[CodePush] registerForNotification: undefined status requested');
	        return false;
	    }
	    if (typeof callback !== 'function') {
	        logModule.err('[CodePush] registerForNotification: callback is not a function');
	        return false;
	    }
	    if (!registeredCallbacks[status]) {
	        registeredCallbacks[status] = [];
	    }

	    registeredCallbacks[status].push(callback);
	    return true;        
	};

	var onDownloadProgress = function(downloadProgress) {
	    if (downloadProgress) {
	        // Update 'downloading' modal with current download %
	        logModule.log('[CodePush] Downloading ' + downloadProgress.receivedBytes + ' of ' + downloadProgress.totalBytes);
	    }
	};

	protectedInterface.initialize = function() {
	    if (typeof window.codePush === 'undefined') {
	        return Promise.reject('[CodePush] missing cordova plugin!');
	    }

	    protectedInterface.syncStatus = window.SyncStatus;

	    // Silently check for the update, but
	    // display a custom downloading UI
	    // via the SyncStatus and DowloadProgress callbacks
	    window.codePush.sync(onSyncStatus, null, onDownloadProgress);
	    return Promise.resolve();
	};

	protectedInterface.name = function() {
	    return 'codepush';
	};

	module.export = protectedInterface;


	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(37)(module)))

/***/ }),
/* 37 */
/***/ (function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(1);
	var device = __webpack_require__(5);
	var logModule = __webpack_require__(33);

	module.exports.initialize = function(initializeConf) {
	    if (typeof window.StatusBar === 'undefined') {
	        // missing cordova plugin
	        return Promise.reject('[StatusBar] missing cordova plugin');
	    }
	    
	    
	    if (!initializeConf ||
	        initializeConf.constructor !== Object ||
	        Object.keys(initializeConf).length === 0) {
	            
	        return Promise.reject('[StatusBar] invalid configuration');
	    }
	    
	    
	    if (initializeConf.color) {
	        // logModule.log('color: '+initializeConf.color);
	        window.StatusBar.backgroundColorByHexString(initializeConf.color);
	    }

	    return Promise.resolve();
	};

	module.exports.setVisibility = function(visibility) {
	    if (typeof window.StatusBar === 'undefined') {
	        // missing cordova plugin
	        return Promise.reject('[StatusBar] missing cordova plugin');
	    }

	    if (visibility) {
	        window.StatusBar.show();
	        return Promise.resolve('statusbar shown');
	    }

	    window.StatusBar.hide();
	    return Promise.resolve('statusbar hided');
	};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(1);
	var packageJson = __webpack_require__(40);

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

/***/ }),
/* 40 */
/***/ (function(module, exports) {

	module.exports = {"name":"stargatejs-device","version":"0.1.0","description":"StargateJS local device","keywords":[],"license":"MIT","contributors":[{"name":"Mirco Cipriani","email":"mirco.cipriani@docomodigital.com"}],"files":["dist/","CHANGELOG.md","package.json","README.md"],"main":"dist/main.js","repository":{"type":"git","url":"https://github.com/D-Mobilelab/stargatejs-device"},"scripts":{"test":"gulp test"},"dependencies":{"axios":"^0.16.2"},"devDependencies":{"browser-sync":"^2.18.12","del":"^2.2.2","eslint":"^3.19.0","eslint-config-airbnb-base":"^11.2.0","eslint-plugin-import":"^2.3.0","gulp":"^3.9.1","gulp-coveralls":"^0.1.4","gulp-eslint":"^3.0.1","gulp-insert":"^0.5.0","gulp-jsdoc3":"^1.0.1","gulp-shell":"^0.5.2","gulp-webpack":"^1.5.0","istanbul-instrumenter-loader":"^2.0.0","istanbul-lib-coverage":"^1.1.1","jasmine-core":"^2.6.2","karma":"^1.7.0","karma-coverage":"^1.1.1","karma-coverage-istanbul-reporter":"^1.3.0","karma-jasmine":"^1.1.0","karma-phantomjs-launcher":"^1.0.4","karma-spec-reporter":"0.0.31","karma-webpack":"^2.0.2","promise-polyfill":"^6.0.2","webpack":"^2.6.1","yargs":"^8.0.1"},"engines":{"node":"6.11.3"},"private":false}

/***/ })
/******/ ])
});
;