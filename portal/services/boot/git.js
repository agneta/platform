var Promise = require('bluebird');
var nodegit = require('nodegit');
var path = require('path');
var _ = require('lodash');
var yaml = require('js-yaml');

module.exports = function(app) {

    var webPrj = app.get('options').web.project;

    function getPath(value) {
        if (value.indexOf(webPrj.paths.project) === 0) {
            return path.relative(
                webPrj.paths.project,
                value);
        }

        return value;
    }

    app.git = {
        getPath: getPath,
        name: '.git'
    };

    require('./git/addFiles')(app);
    require('./git/addAll')(app);
    require('./git/createYaml')(app);
    require('./git/update')(app);
    require('./git/credentials')(app);
    require('./git/log')(app);
    require('./git/status')(app);
    require('./git/readFile')(app);
    require('./git/readYaml')(app);
    require('./git/push')(app);

    return require('./git/init')(app);

};
