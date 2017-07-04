var loopback = require('loopback');
var path = require('path');
var boot = require('loopback-boot');
var enforce = require('express-sslify');
var modelDefinitions = require('./model-definitions');
var bootGenerator = require('./boot-generator');
var _ = require('lodash');

module.exports = function(options) {

    options = options || {};

    require('../lib/moment');
    var app = loopback();

    require('../lib/helpers')(app);
    require('../lib/log')(app);
    require('../lib/gis')(app);

    /////////////////////////////////////////////////
    //
    /////////////////////////////////////////////////

    app.httpServer = options.server;
    app.set('view engine', 'ejs');
    app.set('json spaces', 2);
    app.set('trust proxy', 1);
    app.set('views', path.resolve(__dirname, 'views'));

    options.app = app;

    return {
        locals: options,
        init: function() {
            require('../lib/locals')(app, options);
            require('../lib/socket')(app);
            return Promise.resolve();
        },
        start: function() {

            var bootGenerated = bootGenerator(app, {
                models: app.configurator.load('model-config'),
                modelDefinitions: [],
                _definitions: {}
            });

            return modelDefinitions(app, bootGenerated)
                .then(function() {
                    return new Promise(function(resolve, reject) {
                        boot(app, {
                            appRootDir: __dirname,
                            models: bootGenerated.models,
                            modelDefinitions: bootGenerated.modelDefinitions,
                            middleware: app.configurator.load('middleware'),
                            dataSources: app.configurator.load('datasources'),
                            bootDirs: [
                                path.join(__dirname, 'boot'),
                                path.join(app.get('services_dir'), 'boot')
                            ]
                        }, function(err) {
                            if (err) {
                                reject(err);
                                return;
                            }
                            app.indexes.updateDatasources(['db', 'db_prd']);
                            app.emit('booted');
                            resolve();
                        });

                    });

                });

        }
    };
};
