module.exports = function(app) {

  app.form = {};
  
  var client = app.get('options');
  client = client.web || client.client;
  var clientHelpers = client.app.locals;

  require('./form/fields')(app, clientHelpers);
  require('./form/check')(app, clientHelpers);
};
