const _ = require('lodash');

module.exports = function(template){

  template.list = template.list || {};
  template.list = _.defaults(template.list, {
    order: ['title', 'created_at', 'modified_at'],
    labels: {
      title: 'title',
      subtitle: 'path',
      image: 'cover'
    }
  });
  var labels = template.list.labels;
  labels.metadata = labels.metadata || [];

};
