var _ = require('lodash');

module.exports = function(locals) {

    var project = locals.project;

    project.extend.helper.register('loadScripts', function() {

        var lines = [];

        lines.push(this.js('lib/angular.min'));

        //------------------------------

        var arr;
        var angularDeps = "";
        var angular_libs = this.config.angular_libs;

        //-------------------------------

        arr = _.uniqBy(angular_libs,'js');

        for (var lib of arr) {

            if (angularDeps.length) {
                angularDeps += ',';
            }

            if (lib.dep) {
                angularDeps += "'" + lib.dep + "'";
            }

            lines.push(this.js(lib.js));
        }

        //-------------------------------
        arr = _.uniq(this.config.scripts);

        for (var script of arr) {
            lines.push(this.js(script));
        }

        return {
            angularDeps: angularDeps,
            lines: lines.join('\n')
        };
    });

};
