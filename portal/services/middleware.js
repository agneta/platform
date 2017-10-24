const path = require('path');
module.exports = function(app) {


  var routes = {};

  routes[path.join(__dirname, 'middleware/preview-web')] = {
    'params': [app],
    paths: ['/preview/real-time']
  };

  routes[path.join(__dirname, 'middleware/preview-services')] = {
    'params': [app],
    paths: ['/preview/services']
  };

  routes[path.join(__dirname, 'middleware/preview-local')] = {
    'params': [app],
    paths: ['/preview/local']
  };

  return {
    routes: routes
  };

};
