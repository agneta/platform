module.exports = function(app) {

  var pages = app.get('options').web;
  var services = pages.services;

  return services;

};
