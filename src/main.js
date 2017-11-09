var Promise = require('promise-polyfill');
var device = require('./device');
var iaplight = require('./iaplight');
var share = require('./share');
var codepush = require('./codepush');
var statusbar = require('./statusbar');
var logModule = require('./log');
var app = require('./app');


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