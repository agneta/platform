const extend = require('./extend');
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

  project.extend.generator = new extend.Generator();

  project.on = function(name, callback) {
    var listener = (listeners[name] = listeners[name] || []);
    listener.push(callback);
  };
};
