module.exports = function(Model, app) {

  require('./list')(Model,app);
  require('./remove')(Model,app);

};
