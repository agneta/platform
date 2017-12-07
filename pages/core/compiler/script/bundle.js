const _ = require('lodash');

module.exports = function(project, helpers) {

  var bundle = '';

  helpers.bundle = function() {

    if(bundle.length){
      return bundle;
    }

    concat('lib/angular.min');

    for (var lib of _.uniqBy(project.config.angular_libs,'js')) {
      concat(lib.js);
    }

    for (var script of _.uniq(project.config.scripts)) {
      concat(script);
    }

    function concat(script){
      bundle += `\n\n//----------    ${script}   -------------\n\n`;
      bundle += helpers.template(script);
    }

    return bundle;

  };
};
