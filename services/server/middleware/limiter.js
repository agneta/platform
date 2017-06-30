var ExpressBrute = require('express-brute');
var MongoStore = require('express-brute-mongo');
var MongoClient = require('mongodb').MongoClient;
var moment = require('moment');
var _ = require('lodash');

module.exports = function(app, config) {

    var messages = {
        limitReached: {
            title: {
                gr: 'Έχετε υπερβεί το όριο',
                en: 'Limit reached'
            },
            text: {
                gr: 'Έχετε κάνει πολλές προσπάθειες σε σύντομο χρονικό διάστημα, δοκιμάστε ξανά ',
                en: "You've made too many attempts in a short period of time, please try again "
            }
        }
    };

    var configLimiter = app.get('limiter');

    app.locals.limiters = app.locals.limiters || {};

    var store = new MongoStore(function(ready) {
        MongoClient.connect(app.get('db').url, function(err, db) {
            if (err) throw err;
            ready(db.collection('Limiter'));
        });
    });

    var limiter = new ExpressBrute(store,
        _.extend({
            failCallback: failCallback
        }, config.options));

    limiter.name = config.name;
    limiter.title = config.title;

    app.locals.limiters[limiter.name] = limiter;

    function failCallback(req, res, next, nextValidRequestDate) {

        var message = messages.limitReached;
        var lng = app.getLng(req);
        switch (lng) {
            case 'gr':
                lng = 'el';
                break;
            default:

        }
        moment.locale(lng);

        res.status(429).send({
            title: app.lng(message.title, req),
            message: app.lng(message.text, req) + moment(nextValidRequestDate).fromNow(),
            nextValidRequestDate: nextValidRequestDate
        });

    }

    return function(req, res, next) {
        if (!config.isGlobal && configLimiter.whitelist.indexOf(req.ip) >= 0) {
            next();
            return;
        }
        limiter.prevent(req, res, next);
    };
};
