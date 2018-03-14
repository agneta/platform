module.exports = function(Model, app) {

  require('./servers')(Model, app);
  require('./clusters')(Model, app);

};
