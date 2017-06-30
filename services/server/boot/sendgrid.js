var DataSource = require('loopback-datasource-juggler').DataSource;
var utils = require('loopback/lib/utils');
var path = require('path');
var ejs = require('ejs');
var fs = require('fs');
var _ = require('lodash');
var htmlToText = require('html-to-text');

module.exports = function(app) {


    var config = app.get('email');

    if (!config) {
        throw new Error('No Email config is present');
    }

    var dataSource;

    if (config.sendgrid) {
        dataSource = new DataSource('loopback-connector-sendgrid', {
            api_key: config.sendgrid.apiKey
        });
    }

    if (!dataSource) {
        throw new Error('Must have an email datasource');
    }

    app.loopback.Email.attachTo(dataSource);

    var emailSend = app.loopback.Email.send;

    app.loopback.Email.send = function(options, cb) {

        cb = cb || utils.createPromiseCallback();

        options.from = options.from || config.contacts.default;

        //-------
        if (!options.req) {
            return cb(new Error('Must have a request object to send email'));
        }
        options.language = app.getLng(options.req);

        //-------

        options.sender = options.from;
        if (_.isString(options.from)) {
            options.sender = {
                email: options.from
            };
        }
        options.from = options.sender.email;

        //-------

        options.receiver = options.to;
        if (_.isString(options.to)) {
            options.receiver = {
                email: options.to
            };
        }
        options.to = options.receiver.email;

        //-------

        _.extend(options.data, {
            info: config.info
        });

        ///////////////////////////////////////////////////////////////
        //
        ///////////////////////////////////////////////////////////////

        var template = config.templates[options.templateName];

        if (template) {
            template.render(options.data, function(err, renderResult) {

                if (err) {
                    return cb(err);
                }

                options.html = renderResult.html;
                options.text = renderResult.text;

                send();
            });

        } else {
            send();
        }

        ///////////////////////////////////////////////////////////////

        function send() {

            options.text = options.text || config.text(options.html);

            if (_.isObject(options.subject)) {
                options.subject = app.lng(options.subject, options.language);
            }

            emailSend.call(app.loopback.Email, options)
                .catch(function(err) {
                    console.error(err);
                });
        }


        return cb.promise;
    };

};
