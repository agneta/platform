const path = require('path');
const express = require('express');

var app = express();

var platformPath = path.join(__dirname, '../..');

app.requirePortal = function(reqPath) {
    return require(path.join(platformPath, 'portal', reqPath));
};

app.requireServices = function(reqPath) {
    return require(path.join(platformPath, 'services', reqPath));
};

app.requireServices('lib/locals')(app);

require('./git')(app);
