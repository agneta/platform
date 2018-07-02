const appName = process.env.APP_NAME || 'website';
const path = require('path');

function init(data) {
  data.website = path.join(data.base, data.appName || appName);

  frontend({
    base: data.website,
    data: data
  });

  backend({
    data: data
  });
  // services

  // editor
  data.editDataRemote = path.join(data.base, 'edit/data-remote');

  return data;
}

function frontend(options) {
  var data = options.data || {};
  var base = options.base || data.base;
  // website
  data.config = path.join(base, 'config.yml');
  data.data = path.join(base, 'data');
  data.build = path.join(base, 'build');
  data.tmp = path.join(base, 'tmp');
  data.scripts = path.join(base, 'scripts');
  // source
  data.source = path.join(base, 'source');
  data.lib = path.join(data.source, 'lib');
  data.generated = path.join(data.source, 'generated');

  return data;
}

function backend(options) {
  var data = options.data || {};
  var base = options.base || data.base;

  data.services = path.join(base, 'services');
  data.models = path.join(data.services, 'models');
  data.email = path.join(data.services, 'email');

  return data;
}

module.exports = {
  init: init,
  frontend: frontend,
  backend: backend
};
