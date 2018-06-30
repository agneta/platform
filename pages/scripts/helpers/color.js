var color = require('color');

module.exports = function(locals) {
  locals.project.extend.helper.register('color', color);
};
