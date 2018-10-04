const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function(Model, app) {
  var project = app.web.project;
  Model.sync = function(data) {
    return Promise.resolve().then(function() {
      if (!data.isSource) {
        return;
      }

      if (!data.source) {
        return;
      }

      return Promise.map(project.config.languages, function(language) {
        var attrs = _.pick(data, ['path', 'source', 'template', 'mtime']);
        attrs.title = app.lng(data.title, language.key);
        attrs.lang = language.key;

        return Model.findOne({
          where: {
            path: attrs.path,
            lang: attrs.lang
          },
          fields: {
            id: true,
            mtime: true
          }
        }).then(function(result) {
          result = result || {};
          var a = new Date(result.mtime).getTime();
          var b = new Date(attrs.mtime).getTime();
          if (a == b) {
            return;
          }
          //console.log('sync', a, b);

          return Model.upsertWithWhere(
            {
              path: attrs.path,
              lang: attrs.lang
            },
            attrs
          );
        });
      });
    });
  };
};
