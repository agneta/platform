var loopback = require('loopback');
var path = require('path');
var boot = require('loopback-boot');
var modelDefinitions = require('./model-definitions');
var bootGenerator = require('./boot-generator');

module.exports = function(options) {

    options = options || {};
    var app = options.app || loopback();
    app.httpServer = options.server;
    options.app = app;

    //-------------------------------------------------------

    require('../lib/moment');
    require('../lib/helpers')(app);
    require('../lib/log')(app);
    require('../lib/gis')(app);
    require('../lib/require')(app);

    //-------------------------------------------------------

    app.set('view engine', 'ejs');
    app.set('json spaces', 2);
    app.set('trust proxy', 1);
    app.set('views', path.resolve(__dirname, 'views'));

    //-------------------------------------------------------

    return {
        locals: options,
        init: function() {
            require('../lib/locals')(app, options);
            if (!options.disableSocket) {
                require('../lib/socket')({
                    worker: options.worker,
                    app: app
                });
            }

            return Promise.resolve();
        },
        start: function() {

            if (options.building) {
                return;
            }

            var bootGenerated = bootGenerator(app, {
                models: app.configurator.load('model-config'),
                modelDefinitions: [],
                _definitions: {}
            });

            return modelDefinitions(app, bootGenerated)
                .then(function() {
                    return new Promise(function(resolve, reject) {

                        var bootOptions = {
                            appRootDir: __dirname,
                            models: bootGenerated.models,
                            modelDefinitions: bootGenerated.modelDefinitions,
                            middleware: app.configurator.load('middleware'),
                            dataSources: app.configurator.load('datasources'),
                            bootDirs: [
                                path.join(__dirname, 'boot'),
                                path.join(app.get('services_dir'), 'boot')
                            ]
                        };

                        boot(app, bootOptions, function(err) {
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
