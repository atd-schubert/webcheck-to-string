/*jslint node:true*/

/*global describe, it, before, after, beforeEach, afterEach*/

'use strict';

var ToStringPlugin = require('../');

var Webcheck = require('webcheck');
var freeport = require('freeport');
var express = require('express');

describe('Cheerio Plugin', function () {
    var port;
    before(function (done) {
        var app = express();

        /*jslint unparam: true*/
        app.get('/', function (req, res) {
            res.send('<html><head></head><body><p>index</p></body></html>');
        });
        app.get('/500', function (req, res) {
            res.status(500).send('<html><head></head><body><p>500</p></body></html>');
        });
        app.get('/xml', function (req, res) {
            res.type('xml').send('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><directory><title>XML</title></directory>');
        });
        app.get('/json', function (req, res) {
            res.send({test: 'OK'});
        });
        app.get('/avatar', function (req, res) {
            res.sendFile(process.cwd() + '/test-server/avatar.png');
        });
        /*jslint unparam: false*/

        freeport(function (err, p) {
            if (err) {
                done(err);
            }
            port = p;
            app.listen(port);
            done();
        });
    });

    describe('Basic functions', function () {
        var webcheck, plugin;

        before(function () {
            webcheck = new Webcheck();
            plugin = new ToStringPlugin();
            webcheck.addPlugin(plugin);
            plugin.enable();
        });
        it('should serve getString in result', function (done) {
            var found;
            webcheck.once('result', function (result) {
                if (typeof result.getString === 'function') {
                    found = true;
                }
            });
            webcheck.crawl({
                url: 'http://localhost:' + port
            }, function (err) {
                if (err) {
                    return done(err);
                }
                if (found) {
                    return done();
                }
                return done(new Error('Function not found'));
            });
        });
        it('should stringify text response', function (done) {
            webcheck.once('result', function (result) {
                result.getString(function (err, str) {
                    if (err) {
                        return done(err);
                    }
                    if (str === '<html><head></head><body><p>index</p></body></html>') {
                        return done();
                    }
                    return done(new Error('Wrong string parsed'));
                });
            });
            webcheck.crawl({
                url: 'http://localhost:' + port
            }, function (err) {
                if (err) {
                    return done(err);
                }
            });
        });
        it('should not serve getString on binary response', function (done) {
            webcheck.once('result', function (result) {
                if (typeof result.getString === 'function') {
                    return done(new Error('Serves getString'));
                }
                return done();
            });
            webcheck.crawl({
                url: 'http://localhost:' + port + '/avatar'
            }, function (err) {
                if (err) {
                    return done(err);
                }
            });
        });
    });
});
