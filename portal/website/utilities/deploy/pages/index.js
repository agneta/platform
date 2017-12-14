module.exports = function(util) {

  var build = require('./build')(util);
  var db = require('./db')(util);

  return function(options) {

    if (!options.source.pages) {
      return;
    }

    if (options.target.production) {

      return build.production()
        .then(function(){
          return db.production();
        });

    }

    if (options.target.staging) {

      return build.staging()
        .then(function(){
          return db.staging();
        });
    }

  };
};
