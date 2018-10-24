const Redis = require('ioredis');

module.exports = function(app) {
  var secrets = app.secrets.get('redis');
  app.redis = {
    publisher: new Redis(secrets),
    subscriber: new Redis(secrets),
    createClient: function() {
      return new Redis(secrets);
    }
  };
};
