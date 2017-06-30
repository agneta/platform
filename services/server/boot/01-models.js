var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');
var _ = require('lodash');
var stat = Promise.promisify(fs.stat);
var readdir = Promise.promisify(fs.readdir);

module.exports = function(app) {

    var dirs = [
        path.join(__dirname, '../remotes'),
        path.join(app.get('services_dir'), 'remotes')
    ];

    var servicesInclude = app.get('services_include');

    for (var dir of servicesInclude) {
        dirs.push(path.join(dir, "remotes"));
    }

    function getModel(name) {
        var thisName = this.definition.name;
        if (thisName.indexOf('Production_') === 0) {
            return app.models['Production_' + name];
        }
        return app.models[name];
    }

    function runRemotes(keys) {

        dirs.forEach(function(dir) {

            var index = 0;

            keys.forEach(function(key) {
                _runRemote(key, dir);
                index++;
            });

        });

    }

    function runRemote(key) {

        dirs.forEach(function(dir) {

            _runRemote(key, dir);

        });

    }

    function _runRemote(key, dir) {
        var name = key;
        var map = null;
        var Model = null;

        if (_.isObject(key)) {
            name = key.newName || key.model.definition.name;
            map = key.name;
            Model = key.model;
        } else {
            Model = app.models[name];
        }

        name = name.toLowerCase();

        if (map) {
            name = map.toLowerCase();
        }

        var file = path.join(dir, name) + '.js';

        if (fs.existsSync(file)) {
            require(file)(Model, app);
        }

        //--------------------------------

        Model.getModel = getModel;
    }

    runRemotes(
        _.keys(app.models)
    );

    app.helpers.runRemotes = runRemotes;
    app.helpers.runRemote = runRemote;


};
