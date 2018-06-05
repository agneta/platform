module.exports = function(Model, app) {

  require('./update')(Model,app);
  require('./get')(Model,app);

};
