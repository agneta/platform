const moment = require('moment');

module.exports = function() {
  return function(req, res) {
    var duration = process.uptime();
    duration = moment.duration(duration, 'seconds').humanize();
    res.send({
      status: 'running',
      uptime: duration
    });
  };
};
