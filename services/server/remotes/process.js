module.exports = function(Model, app) {

  Model.io = app.socket.namespace({
    name: 'process',
    auth: {
      allow: [
        'administrator'
      ]
    }
  });


  require('./process/logs')(Model, app);
  require('./process/metrics')(Model, app);
  require('./process/restart')(Model, app);

  require('./process/changes/list')(Model, app);
  require('./process/changes/refresh')(Model, app);

};
