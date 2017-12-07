const _ = require('lodash');

module.exports = function(project, helpers) {

  var bundle = '';

  helpers.bundle = function() {

    if(bundle.length){
      return bundle;
    }

    var arr;

    concat('lib/angular.min');

    arr = _.uniqBy(this.config.angular_libs,'js');
    for (var lib of arr) {
      concat(lib.js);
    }

    arr = _.uniq(this.config.scripts);
    for (var script of arr) {
      concat(script);
    }

    function concat(script){
      bundle += helpers.template(script);
      bundle += '\n';
    }

    return bundle;

  };
};
