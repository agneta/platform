module.exports = function(util) {

  return function(options) {

    if (options.target != 'production') {
      return;
    }

    return Promise.resolve()
      .then(function() {
        return require('./media')(util,options);
      });

  };

};
