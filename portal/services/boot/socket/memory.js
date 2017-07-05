var prettyBytes = require('pretty-bytes');
var _ = require('lodash');

module.exports = function(app) {

    var socket = app.portal.socket;
    var memoryLimit = 512;

    function memoryUsage() {
        setTimeout(function() {

            var usage = process.memoryUsage();

            usage = _.pick(usage, ['rss', 'heapTotal', 'heapUsed']);
            var keys = _.keys(usage);

            usage = _.zipObject(keys, _.map(keys, function(key) {
                var value = usage[key];
                return {
                    value: value,
                    title: prettyBytes(value),
                    percentage: ((value / (1024 * 1024)).toFixed(2) / memoryLimit).toFixed(2)
                };
            }));

            socket.emit('memory:update', {
                usage: usage,
                limit: memoryLimit
            });

            memoryUsage();
        }, 5000);
    }

    memoryUsage();


};
