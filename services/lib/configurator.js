var _ = require('lodash');
var path = require('path');

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

module.exports = function(app) {

    var servicesDir = app.get('services_dir');
    var locals = app.get('options');

    if (process.env.SERVICES_ENV) {
        app.set('env', process.env.SERVICES_ENV);
    }

    var env = app.get('env');

    //------------------------------------------------------

    switch (env) {
        case 'development':
        case 'local':
            app.set('web_url', locals.host);
            break;
    }

    //console.log('Running on env:',env);

    function data(file) {
        var result = null;
        try {
            result = require(file);
        } catch (e) {
            if (e.code == 'MODULE_NOT_FOUND') {
                if (e.message.indexOf(file) < 0) {
                    throw e;
                }
            } else {
                throw e;
            }
        }

        if (_.isFunction(result)) {
            result = result(app);
        }

        return result || {};

    }

    var dirs = [
        path.join(__dirname, '../server'),
    ];

    dirs = dirs.concat(app.get('services_include'));
    dirs = dirs.concat(servicesDir);

    function load(name) {

        var result = {};

        for (var dir of dirs) {

            _.merge(
                result,
                data(path.join(dir, name))
            );

            _.merge(
                result,
                data(path.join(dir, name + '.' + env))
            );

        }

        return result;
    }

    app.configurator = {
        load: load
    };

    return app.configurator;

};
