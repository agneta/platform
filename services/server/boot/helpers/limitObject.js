const _ = require('lodash');

module.exports = function(data, options) {

  var depth = options.depth || 3;

  function check(collection, options) {

    //console.log('depthIndex',options.depth,depth);
    var newCollection;
    if (_.isObject(collection)) {
      newCollection = {};
    }

    if (_.isArray(collection)) {
      newCollection = [];
    }

    if (!newCollection) {
      return collection;
    }

    if (options.depth > depth) {
      return;
    }

    var keys = _.keys(collection);

    keys.map(function(key) {
      var value = collection[key];

      if (_.isFunction(value)) {
        return;
      }
      var checkValue = check(value, {
        depth: options.depth + 1
      });
      if (!_.isUndefined(checkValue)) {
        newCollection[key] = checkValue;
      }
    });

    if (!_.size(newCollection)) {
      return;
    }
    return newCollection;
  }

  return check(data, {
    depth: 1
  });
};
