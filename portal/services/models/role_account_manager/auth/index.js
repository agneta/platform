module.exports = function(Model, app) {

  require('./cert-add')(Model,app);
  require('./cert-list')(Model,app);
  require('./cert-remove')(Model,app);
  require('./cert-update')(Model,app);

  require('./ip-add')(Model,app);
  require('./ip-list')(Model,app);
  require('./ip-remove')(Model,app);

  require('./ssh-add')(Model,app);
  require('./ssh-list')(Model,app);
  require('./ssh-remove')(Model,app);

};
