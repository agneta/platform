var Queue = require('bull');

module.exports = function(app) {
  var secretConfig = app.secrets.get('redis');
  if (!secretConfig) {
    return;
  }
  console.log(secretConfig);
  var queue = new Queue('agneta', {
    redis: secretConfig
  });
  app.queue = queue;
};
