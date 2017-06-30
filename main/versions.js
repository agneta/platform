var path = require('path');

module.exports = function(paths){
var pages;
var services;
  try{
    pages = require(path.join(paths.framework,'package.json')).version;
  }catch(e){
  }

  try{
    services = require(path.join(paths.services,'package.json')).version;
  }catch(e){
  }

  return {
    cli: require('../package.json').version,
    pages: pages,
    services: services
  };
};
