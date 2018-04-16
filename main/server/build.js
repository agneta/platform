const config = require('../config');
const path = require('path');
const start = require('../start');
const paths = require('../paths');
const Build = require(path.join(paths.pages.base, 'core/build'));
const _ = require('lodash');

module.exports = function(options) {

  options = options || {};
  options.env = options.env || 'local';

  var buildPages = start.pages({
    mode: 'default',
    locals: _.extend({}, config, {
      root: paths.url.preview.local,
      buildOptions: {
        assets: true,
        pages: true
      }
    })
  });

  var buildServices = start.services({
    root: paths.url.preview.services,
    website: {
      root: paths.url.preview.local
    },
    building: true,
    dir: paths.core.project
  });

  buildServices.locals.env = options.env;
  buildPages.locals.env = options.env;

  buildServices.locals.client = buildPages.locals;
  buildServices.locals.web = buildPages.locals;

  buildPages.locals.services = buildServices.locals.app;
  buildPages.locals.portal = buildServices.locals.app;

  var build = Build(buildPages.locals);

  return start.init([
    buildServices,
    buildPages
  ])
    .then(function() {
      return build(options);
    });

};
