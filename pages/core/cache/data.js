const path = require('path');
const LRU = require("lru-cache");

module.exports = function(locals) {

    var project = locals.project;

    const dirs = LRU();
    const files = LRU({
        max: 20 * 1000,
        length: function(item) {
            return item.$size;
        }
    });

    locals.cache.data = {
        dirs: dirs,
        files: files,
        invalidate: function() {
            files.reset();
            dirs.reset();
        }
    };

};
