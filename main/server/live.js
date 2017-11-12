const _ = require('lodash');
const url = require('url');
const request = require('request');

module.exports = function(options){

  var languages;
  var storageConfig;

  var project;

  require('./services')(options)
    .then(function(result) {
      project = result.webPages.locals.project;
      languages = _.get(project, 'site.languages');
      storageConfig = result.services.locals.app.get('storage');
    });


  options.app.use(function(req, res, next) {

    var pathParts = req.path.split('/');

    pathParts = pathParts.filter(function(n) {
      return _.isString(n) && n.length;
    });

    if (pathParts.length == 0 ||
      languages[pathParts[0]]
    ) {

      var reqPath = url.format({
        hostname: storageConfig.buckets.assets.host,
        protocol: 'https',
        pathname: req.path
      });

      request
        .get(reqPath)
        .pipe(res);
      return;

    }

    next();
  });

};
