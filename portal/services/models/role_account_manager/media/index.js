module.exports = function(Model, app) {

  require('./upload')(Model,app);
  require('./get')(Model,app);
  require('./update')(Model,app);

};
