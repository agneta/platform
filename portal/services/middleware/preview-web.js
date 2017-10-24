module.exports = function(app) {

  var pages = app.get('options').web;

  return pages.app;

};
