var path = require('path');

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
