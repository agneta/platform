var _ = require('lodash');
var beautify_html = require('js-beautify').html;

module.exports = function(locals) {
  locals.page.renderData = function(data) {
    let helpers = locals.app.locals;
    let data_render = _.extend({
      page: data
    });

    return helpers.template('page', data_render).then(function(body) {
      data_render.body = body;
      return helpers.template('layout', data_render).then(function(content) {
        if (!data.barebones || data.isView) {
          content = beautify_html(content, {
            indent_size: 2,
            max_preserve_newlines: 0,
            wrap_attributes: 'force'
          });
        }

        return content;
      });
    });
  };
};
