const extend = require('../pages/extend');
const Promise = require('bluebird');

module.exports = function(locals) {

  var listeners = {};
  var project = locals.project;

  project.call_listeners = function(listener) {
    // body...
    var list = listeners[listener] || [];
    return Promise.map(list, function(entry) {
      return entry();
    });
  };

  project.extend.filter = new extend.Filter();
  project.extend.generator = new extend.Generator();

  // load filters
  require('../pages/filter')(project);

  project.render.isRenderable = function() {
    return true;
  };

  project._showDrafts = function() {
    return project.config.render_drafts;
  };

  project.execFilter = function(type, data, options) {
    return project.extend.filter.exec(type, data, options);
  };

  project.execFilterSync = function(type, data, options) {
    return project.extend.filter.execSync(type, data, options);
  };

  project.on = function(name, callback) {
    var listener = listeners[name] = listeners[name] || [];
    listener.push(callback);
  };

};
