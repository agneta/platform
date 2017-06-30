var Promise = require("bluebird");
var _ = require("lodash");
var randomColor = require('randomcolor');
const path = require('path');

module.exports = function(Model, app) {

    var infoMethods = {};

    Model.registerInfo = function(type, method) {

        infoMethods[type] = method;
    };

    Model.getInfo = function(activity, req) {

        activity = activity.__data || activity;

        var type = (activity.action && activity.action.type) ||
            activity.action_type;

        if (!type) {
            return Promise.resolve(activity);
        }

        return Promise.resolve()
            .then(function() {

                var method = infoMethods[type];

                if (!method) {
                    activity.title = activity.data.message;
                    return activity;
                }
                return method(activity, req);

            })
            .then(function(result) {
                return result || activity;
            });

    };

    Model.registerInfo('form', function(activity) {
        var params = activity.data.request.params;

        activity.title = [params.first_name, params.last_name].join(' ');
        activity.subtitle = params.email;
        activity.modal = "activity-form";

    });

    Model.registerInfo('error', function(activity) {

        var error = activity.data.error || activity.data;
        if (!error) {
            //console.log(activity.data);
            return;
        }

        if (error.message) {
            if (error.message.indexOf('\n') > 0) {
                error.message = error.message.split('\n');
                error.message = error.message[error.message.length - 1];
            }
        }

        activity.title = error.message || error.code || error.name;

        if (error.stack) {
            var entry = error.stack[0];
            var file = path.parse(entry.file).base;

            activity.subtitle = `${file} [${entry.lineNumber},${entry.column}]`;
        }

    });

};
