var Queue = require('bull');

module.exports = function(app) {
  var secretConfig = app.secrets.get('redis');
  if (!secretConfig) {
    return;
  }

  var opts = {
    createClient: function(type) {
      switch (type) {
        case 'client':
          return app.redis.publisher;
        case 'subscriber':
          return app.redis.subscriber;
        default:
          return app.redis.createClient();
      }
    }
  };

  var queue = new Queue('agneta', opts);
  app.queue = queue;
};
