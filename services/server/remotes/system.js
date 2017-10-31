

module.exports = function(Model, app) {

  require('./system/logs')(Model, app);
  require('./system/metrics')(Model, app);

};
