var fs = require('fs-extra');
var url = require('url');
var path = require('path');
var urljoin = require('url-join');
var yaml = require('js-yaml');
var _ = require('lodash');
var extend = require('../pages/extend');
var database = require('./database');
var Promise = require('bluebird');
var Loader = require('./load');
var Cache = require('./cache');

module.exports = function(locals) {

    Cache(locals);

    var load = Loader(locals);
    var listeners = {};

    ///////////////////////////////////////////
    // GLOBALS
    ///////////////////////////////////////////

    var project = locals.project;

    require('./theme')(locals);

    project.call_listeners = function(listener) {
        // body...
        var list = listeners[listener] || [];
        return Promise.map(list, function(entry) {
            return entry();
        });
    };

    project.extend.filter = new extend.Filter();
    project.extend.generator = new extend.Generator();

    // load filters
    require('../pages/filter')(project);

    ///////////////////////////////////////////
    //
    ///////////////////////////////////////////

    project.render.isRenderable = function() {
        return true;
    };

    project._showDrafts = function() {
        return project.config.render_drafts;
    };

    project.execFilter = function(type, data, options) {
        return project.extend.filter.exec(type, data, options);
    };

    project.execFilterSync = function(type, data, options) {
        return project.extend.filter.execSync(type, data, options);
    };

    function init() {

        database(locals);

        /////////////////////////////////////////////////
        // HELPERS

        var helper = project.extend.helper = {};

        helper.register = function(name, callback) {

            locals.app.locals[name] = function() {
                return callback.apply(_.extend({
                    config: project.config
                }, this, locals.app.locals), arguments);
            };

        };

        locals.app.locals.mode = locals.mode;
        locals.app.locals.agneta = locals.project;
        locals.app.locals.path = path;
        locals.app.locals.fs = fs;

        function deepMerge(object, source) {
            return _.mergeWith(object, source,
                function(objValue, srcValue) {
                    if (_.isObject(objValue) && srcValue) {
                        return deepMerge(objValue, srcValue);
                    }
                    return objValue;
                });
        }
        _.deepMerge = deepMerge;
        locals.app.locals._ = _;

        //////////////////////////////////////////////////

        project.on = function(name, callback) {
            var listener = listeners[name] = listeners[name] || [];
            listener.push(callback);
        };

        /////////////////////////////////////////////////////
        return load.init();

    }

    function start() {
        return load.start()
            .then(function() {
                return project.call_listeners('ready');
            });
    }

    //////////////////////////////////////////////////////

    locals.main = {
        init: init,
        start: start,
        load: load
    };

    return locals.main;
};
