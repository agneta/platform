var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');
var _ = require('lodash');
var readdir = Promise.promisify(fs.readdir);

module.exports = function(app, generated) {

    var definitions = app.modelDefinitions = generated._definitions;

    var servicesDir = app.get('services_dir');
    var servicesInclude = app.get('services_include');

    var dirs = [
        path.join(__dirname, '../models'),
        path.join(app.get('services_dir'), 'models')
    ];

    for (var dir of servicesInclude) {
        dirs.push(path.join(dir, "models"));
    }

    function mergeFn(objValue, srcValue) {
        if (_.isArray(objValue) || _.isArray(srcValue)) {
            objValue = objValue || [];
            srcValue = srcValue || [];
            return srcValue.concat(objValue);
        }
    }

    //-------------------------------------------

    return Promise.map(dirs, function(dir) {

            return readdir(dir)
                .then(function(files) {

                    return Promise.map(files, function(file) {
                        var filePath = path.join(dir, file);
                        var data = require(filePath);
                        if (definitions[file]) {
                            _.mergeWith(definitions[file].definition, data, mergeFn);
                        } else {
                            definitions[file] = {
                                definition: data
                            };
                        }
                    });

                });
        }, {
            concurrency: 1
        })
        .then(function() {
            generated.modelDefinitions = _.values(definitions);
        });
};
