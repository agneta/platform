var _ = require('lodash');

function getBase(page) {
  var data = _.extend({}, page, {
    templateSource: page.template,
    pathSource: page.path,
    barebones: true
  });

  delete data.isSource;
  delete data._id;
  delete data.source;

  return data;
}

module.exports = {
  view: function(page) {
    return _.extend(getBase(page), {
      isView: true
    });
  },
  viewData: function(page) {
    return _.extend(getBase(page), {
      isViewData: true,
      template: 'json/viewData'
    });
  },
  auth: function(page) {
    return _.extend(getBase(page), {
      isView: true,
      template: 'authorization'
    });
  },
  authData: function(page) {
    return _.extend(getBase(page), {
      isViewData: true,
      template: 'json/viewAuthData'
    });
  }
};
