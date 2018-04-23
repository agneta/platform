const path = require('path');
const fs = require('fs-extra');
const config = require('../config');
const structure = require('./structure');

module.exports = function(options){

  var appConfig = options.config;
  var appPaths = options.paths;

  if(!appConfig.extensions){
    return;
  }

  var extensions = config.agneta.get('extensions') || {};
  var result = {};
  appConfig.extensions.map(function(extensionName){

    var extPath = getPath(extensionName);
    if(!fs.pathExistsSync(extPath)){
      throw new Error(`Could not find extension path: ${extPath}`);
    }

    result[extensionName] = structure({
      base: extPath
    });

  });

  function getPath(name) {

    var extOverride = extensions[name];
    if(extOverride){
      return extOverride;
    }

    return path.join(appPaths.base,'node_modules',name);

  }


  return result;
};
