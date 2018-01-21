module.exports = function(app) {

  app.edit = {};

  require('./edit/loadTemplate')(app);
  require('./edit/saveYaml')(app);

};
