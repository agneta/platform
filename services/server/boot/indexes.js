const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function(app) {

    var db;

    app.indexes = {
        autoupdate: function(names) {
            return Promise.map(names, function(name) {
                var Model = app.models[name];
                var dataSource = Model.dataSource;
                return dataSource.autoupdate(name);
            }, {
                concurrency: 1
            });
        },
        updateDatasources: function(names) {
            return Promise.map(names, function(name) {
                var datasource = app.datasources[name];
                if (datasource) {
                    return datasource.autoupdate(_.keys(datasource.connector._models));
                }
            });
        }
    };

};
