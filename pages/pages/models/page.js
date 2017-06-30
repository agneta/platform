var Schema = require('warehouse').Schema;
var moment = require('moment');
var pathFn = require('path');
var Promise = require('bluebird');
var _ = require('lodash');
var Moment = require('./types/moment');
var CacheString = require('./types/cachestring');

function pickID(data) {
    return data._id;
}

module.exports = function(ctx) {

    var basePath = pathFn.relative(ctx.paths.base, ctx.paths.source);

    var Model = new Schema({
        id: String,
        title: {
            type: Object,
            required: true
        },
        source: {
            type: String,
            required: false
        },
        path: {
            type: String,
            required: true
        }
    });

    Model.virtual('full_source').get(function() {
        return pathFn.join(basePath, this.source || '');
    });

    return Model;
};
