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
  require('./token')(Model,app);
  require('./auth')(Model,app);
  require('./role')(Model,app);
  require('./media')(Model,app);
  require('./team_member')(Model,app);

};
