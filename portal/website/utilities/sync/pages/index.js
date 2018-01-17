
module.exports = function(util, parameters) {

  if(!parameters.options.pages){
    return;
  }

  return Promise.resolve()
    .then(function() {
      return require('./search')(util);
    });

};
