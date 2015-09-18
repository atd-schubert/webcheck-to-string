/*jslint node:true*/
'use strict';

var WebcheckPlugin = require('webcheck/plugin');

var pkg = require('./package.json');
/**
 * A helper function for empty regular expressions
 * @private
 * @type {{test: Function}}
 */
var emptyFilter = {
    test: function () {
        return true;
    }
};
/**
 * Buffer to string plugin for webcheck
 * @author Arne Schubert <atd.schubert@gmail.com>
 * @param {{}} [opts] - Options for this plugin
 * @param {RegExp|{test:Function}} [opts.filterStatusCode] - Filter HTTP status code (default all)
 * @param {RegExp|{test:Function}} [opts.filterContentType] - Filter allowed content type (defaults to text, html and xml)
 * @param {RegExp|{test:Function}} [opts.filterUrl] - Filter urls that serves a getString function
 * @augments Webcheck.Plugin
 * @constructor
 */
var ToStringPlugin = function (opts) {
    WebcheckPlugin.apply(this, arguments);

    opts = opts || {};

    opts.filterContentType = opts.filterContentType || /^text|\+xml|html/;
    opts.filterStatusCode = opts.filterStatusCode || emptyFilter;
    opts.filterUrl = opts.filterUrl || emptyFilter;

    this.middleware = function (result, next) {
        var triggered,
            str,
            error,
            cbList = [];

        if (!opts.filterUrl.test(result.url) ||
                !opts.filterContentType.test(result.response.headers['content-type']) ||
                !opts.filterStatusCode.test(result.response.statusCode.toString())) {
            return next();
        }
        /**
         * GetCheerio function added to webcheck result.
         * @param {ToStringPlugin~getString} cb
         * @returns {*}
         */
        result.getString = function getString(cb) {
            var chunks = [];

            if (str || error) {
                return cb(error, str);
            }
            cbList.push(cb);
            if (!triggered) {
                triggered = true;
                result.response.on('data', function (chunk) {
                    try {
                        chunks.push(chunk.toString());
                    } catch (err) {
                        error = err;
                    }
                });
                result.response.on('end', function () {
                    var i;
                    str = chunks.join('');
                    for (i = 0; i < cbList.length; i += 1) {
                        /**
                         * @callback ToStringPlugin~getString
                         * @params {null|error} error - Error if there was one
                         * @params {cheerio.load} Buffer as string
                         */
                        cbList[i](error, str);
                    }
                });
            }
        };
        next();
    };
};

ToStringPlugin.prototype = {
    '__proto__': WebcheckPlugin.prototype,
    package: pkg
};

module.exports = ToStringPlugin;
