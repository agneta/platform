const appName = process.env.APP_NAME || 'website';
const path = require('path');

module.exports = function(obj){

  obj.website = path.join(obj.base, obj.appName || appName);

  // website
  obj.config = path.join(obj.website, 'config.yml');
  obj.data = path.join(obj.website, 'data');
  obj.build = path.join(obj.website, 'build');
  obj.tmp = path.join(obj.website, 'tmp');
  obj.scripts = path.join(obj.website, 'scripts');
  // source
  obj.source = path.join(obj.website, 'source');
  obj.lib = path.join(obj.source, 'lib');
  obj.generated = path.join(obj.source, 'generated');
  // services
  obj.services = path.join(obj.base, 'services');
  obj.models = path.join(obj.services, 'models');
  // email
  obj.email = path.join(obj.base, 'email');


  return obj;
};
