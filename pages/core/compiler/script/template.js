var path = require('path');
var fs = require('fs-extra');
var _ = require('lodash');

module.exports = function(project, helpers) {

  helpers.template = function(path_partial, data) {

    let path_result;

    if (path.parse(path_partial).ext !== '.js') {
      path_partial += '.js';
    }

    if (path_partial.indexOf(project.paths.app.source) === 0 ||
      path_partial.indexOf(project.paths.theme.source) === 0) {
      path_result = path_partial;
    } else {
      path_partial = path.join('source', path_partial);
      path_result = project.theme.getFile(path_partial);
    }

    if (!path_result) {
      let msg = 'Template not found: ' + path_partial;
      console.error(msg);
      throw new Error(msg);
    }

    let file_content = fs.readFileSync(path_result, 'utf8');
    let result = _.template(file_content, {
      interpolate: /_t_(.+?);/g
    })(_.extend(this, data, {
      locals: data
    }));

    return result;

  };
};
