const Promise = require('bluebird');
const _ = require('lodash');
module.exports = function(util) {

  var webProject = util.locals.web.project;
  var services = util.locals.services;
  var Page = services.models.Page;

  var pickProps = [
    'title',
    'path',
    'source',
    'template',
    'authorization',
    'isView',
    'isViewData',
    'date'
  ];

  return function(options) {

    if (options.stage.pages) {

      var pages = webProject.site.pages.find({
        isView: undefined,
        isViewData: undefined
      }).toArray();

      var bar = util.progress(pages.length, {
        title: `Deploy ${pages.length} page to database`
      });

      return Promise.map(pages, function(page) {

        var pageProps = _.pick(page, pickProps);

        return Page.findOne({
          where: {
            path: pageProps.path
          }
        }).then(function(page) {

          if (!page) {
            return Page.create(pageProps);
          }

          return page.updateAttributes(pageProps);

        }).then(function() {
          bar.tick();
        });

      });

    }

    if (options.promote.pages) {
      return require('../lib/sync/database')(util, {
        source: services.models.Page,
        target: services.models.Production_Page,
        key: 'path'
      });
    }

  };
};
