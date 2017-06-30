const LRU = require("lru-cache");

module.exports = function(locals) {

    var cache = LRU({
        max: 500 * 1000,
        maxAge: 10 * 60 * 1000,
        length: function(item) {
            return item.length;
        }
    });

    cache.invalidate = function() {
        cache.reset();
    };

    locals.cache.templates = cache;

};
