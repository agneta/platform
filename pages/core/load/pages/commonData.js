var _ = require('lodash');

module.exports = function(locals) {
  let commonData = {};

  locals.page.commonData = function(page) {
    var key = page.pathSource || page.path;
    var data = commonData[key] || (commonData[key] = {});
    _.defaults(data, {
      scripts: [],
      styles: []
    });
    return data;
  };
};
