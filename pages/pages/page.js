var common = require('./common');
var Promise = require('bluebird');
var pathFn = require('path');
var _ = require('lodash');
var fs = require('hexo-fs');
var util = require('hexo-util');
var slugize = util.slugize;
var Pattern = util.Pattern;
var Permalink = util.Permalink;
var postDir = 'source/';
var draftDir = '_drafts/';
var permalink;

var preservedKeys = {
    title: true,
    year: true,
    month: true,
    day: true,
    i_month: true,
    i_day: true
};

function startsWith(str, prefix) {
    return str.substring(0, prefix.length) === prefix;
}

exports.parseFilename = parseFilename;


exports.process = function(file) {
    return processPost.call(this, file);
};

exports.pattern = new Pattern(function(path) {
    if (common.isTmpFile(path)) return false;

    var result;

    if (startsWith(path, postDir)) {
        result = {
            published: true,
            path: path.substring(postDir.length)
        };
    } else if (startsWith(path, draftDir)) {
        result = {
            published: false,
            path: path.substring(draftDir.length)
        };
    } else {
        return false;
    }

    if (common.isHiddenFile(result.path)) return false;
    return result;
});

function processPost(data) {

    /* jshint validthis: true */
    var Page = this.model('Page');
    var self = this;
    var config = this.config;
    var timezone = config.timezone;
    var promise;
    var path = parseFilename(data.path);

    var doc = Page.findOne({
        path: path
    });

    data.path = path;

    if (data.if && !self.config[data.if]) {
        return;
    }

    if (!data.title) {
        data.title = {
            en: pathFn.parse(data.path).name
        };
    }

    if (doc) {
        return doc.replace(data);
    } else {
        return Page.insert(data);
    }
}

function parseFilename(path) {

    path = path.substring(0, path.length - pathFn.extname(path).length);
    path = pathFn.normalize(path);
    if (path[0] != '/') {
        path = '/' + path;
    }
    return path;
}
