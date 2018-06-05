const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

module.exports = function(locals) {
  var project = locals.project;
  var helper = project.extend.helper = {};
  var appLocals = locals.app.locals;

  helper.register = function(name, callback) {

    appLocals[name] = function() {
      return callback.apply(_.extend({}, this, appLocals), arguments);
    };

  };

  appLocals.mode = locals.mode;
  appLocals.path = path;
  appLocals.fs = fs;
  appLocals._ = _;
  appLocals.config = project.config;
  appLocals.site = project.site;

  if (locals.web) {
    appLocals.config_prj = locals.web.project.config;
  }

  //-----------------------------------------------------------

  _.mergePages = function(objValue, srcValue) {

    return _.mergeWith(objValue, srcValue, mergeFn);

    function mergeFn(objValue, srcValue) {
      if (_.isArray(objValue) || _.isArray(srcValue)) {
        objValue = objValue || [];
        srcValue = srcValue || [];

        return _.uniq(srcValue.concat(objValue));
      }
    }
  };

  //-----------------------------------------------------------

  function deepMerge(object, source) {
    return _.mergeWith(object, source,
      function(objValue, srcValue) {
        if (_.isObject(objValue) && srcValue) {
          return deepMerge(objValue, srcValue);
        }
        return objValue;
      });
  }
  _.deepMerge = deepMerge;

};
