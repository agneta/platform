module.exports = function(Model, app) {

  require('./add')(Model,app);
  require('./edit')(Model,app);
  require('./get')(Model,app);
  require('./list')(Model,app);
  require('./remove')(Model,app);

};
