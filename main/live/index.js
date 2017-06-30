var express = require('express');
var path = require('path');
var app = express();
var projectPaths = require('../paths').project;

module.exports = function() {

    var port = 8181;

    var buildPath = path.join(projectPaths.build,app.get('env'));
    console.log('Build path:',buildPath);
    app.use(express.static(buildPath));
    app.listen(port);

    console.log('Listening on port: ' + port);

};
