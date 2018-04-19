module.exports = function(Model, app) {

  Model.validatesUniquenessOf('accountId', {
    message: 'Account is already an administrator'
  });

  require('./activate')(Model,app);
  require('./activities')(Model,app);
  require('./changePassword')(Model,app);
  require('./clearLimits')(Model,app);
  require('./deactivate')(Model,app);
  require('./filter')(Model,app);
  require('./get')(Model,app);
  require('./new')(Model,app);
  require('./recent')(Model,app);
  require('./remove')(Model,app);
  require('./search')(Model,app);
  require('./total')(Model,app);
  require('./update')(Model,app);

  require('./auth/cert-add')(Model,app);
  require('./auth/cert-list')(Model,app);
  require('./auth/cert-remove')(Model,app);
  require('./auth/cert-update')(Model,app);

  require('./auth/ip-add')(Model,app);
  require('./auth/ip-list')(Model,app);
  require('./auth/ip-remove')(Model,app);

  require('./auth/ssh-add')(Model,app);
  require('./auth/ssh-list')(Model,app);
  require('./auth/ssh-remove')(Model,app);

  require('./role/add')(Model,app);
  require('./role/edit')(Model,app);
  require('./role/get')(Model,app);
  require('./role/list')(Model,app);
  require('./role/remove')(Model,app);

  require('./token/list')(Model,app);
  require('./token/remove')(Model,app);

  require('./picture/change')(Model,app);


};
