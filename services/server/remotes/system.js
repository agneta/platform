module.exports = function(Model, app) {

  Model.io = app.socket.namespace({
    name: 'system',
    auth: {
      allow: [
        'administrator'
      ]
    }
  });


  require('./system/logs')(Model, app);
  require('./system/metrics')(Model, app);

};
