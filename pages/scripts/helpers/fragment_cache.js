'use strict';

module.exports = function(locals) {

    var project = locals.project;
    var cache = {};

    function fragmentCache(id, fn) {
        if (this.cache && cache[id] != null) return cache[id];

        var result = cache[id] = fn();
        return result;
    }

    project.extend.helper.register('fragment_cache', fragmentCache);

};
