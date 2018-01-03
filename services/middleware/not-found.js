const urljoin = require('urljoin');
const _ = require('lodash');
const url = require('url');
const request = require('request');

module.exports = function(app) {

  var project = app.get('options').client.project;
  var storageConfig = app.get('storage');

  return function(req, res) {

    var lang = _.get(project.config, 'language.default.key') || 'en';
    var pathname = urljoin(lang, 'error/not-found');

    var reqPath = url.format({
      hostname: storageConfig.buckets.assets.host,
      protocol: 'https',
      pathname: pathname
    });

    request
      .get(reqPath)
      .pipe(res);

  };
};
