const _ = require('lodash');
const loaderUtils = require('loader-utils');

module.exports = function(source) {

  var loaderOptions = loaderUtils.getOptions(this) || {};

  return _.template(source, {
    interpolate: /\$\$template\.(.+?);/g
  })({
    configServices: function(name,configPath){
      var result = loaderOptions.locals.services.get(name);
      if(configPath){
        result = _.get(result,configPath);
      }
      result = JSON.stringify(result);
      return `JSON.parse('${result}');`;
    }
  });

};
