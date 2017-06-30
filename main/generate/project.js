var fs = require('fs-extra');
var log = require('../log');
var path = require('path');

module.exports = function() {
    fs.copy(path.join(__dirname, '../..', 'template'), process.cwd(), {
        clobber: false
    }, function() {
        log.success('Creation Complete');
    });
};
