var _ = require('lodash');
var Promise = require('bluebird');
var shortid = require('shortid');

module.exports = function(Model, app) {

    app.helpers.mixin("disableAllMethods", Model);

    var locals = app.get('options').client;
    var project = locals.project;

    var io = app.io.create({
        name: 'utilities',
        auth: {
            allow: [
                'administrator'
            ]
        }
    });

    for (var key in project.utilities) {

        initUtility(
            project.utilities[key]
        );

    }

    function initUtility(utility) {

        var instance = utility.runner({
            locals: locals,
            log: function() {
                utility.addLine({
                    type: 'log',
                    arguments: arguments
                });
            },
            success: function() {
                utility.addLine({
                    type: 'success',
                    arguments: arguments
                });
            },
            progress: function(length, options) {
                var id = shortid.generate();
                var progressOptions = {
                    id: id,
                    length: length,
                    options: options
                };
                utility.emit('progress:new', progressOptions);
                return {
                    tick: function(options) {
                        options = options || {};
                        utility.emit('progress:tick', {
                            id: id,
                            options: options
                        });
                    },
                    addLength: function(length) {
                        progressOptions.length += length;
                        utility.emit('progress:update', progressOptions);
                    }
                };
            }
        });

        instance.status = {};

        utility.instance = instance;

        utility.emit = function(name, options) {
            io.emit(utility.name + ':' + name, options);
        };

        utility.addLine = function(options) {

            if (options.arguments) {
                var args = Array.prototype.slice.call(options.arguments);
                options.message = args.join(' ');
            }

            utility.emit('addLine', {
                message: options.message,
                type: options.type
            });
        };
    }

    Model.getUtility = function(name) {
        var utility = project.utilities[name];

        if (!utility) {
            return Promise.reject({
                statusCode: 400,
                message: 'Utility not found'
            });
        }

        return Promise.resolve(utility);

    };

    require('./utility/status')(Model, app);
    require('./utility/start')(Model, app);


};
