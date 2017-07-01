module.exports = function(Model, app) {

  Model.__email = app.get('email');


  require('./email_template/getAll')(Model,app);
  require('./email_template/render')(Model,app);
};
