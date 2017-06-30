const ProgressBar = require('progress');

module.exports = function(length, options) {

    if (options.title) {
        console.log(options.title);
    }

    var bar = new ProgressBar('[:percent] :title', {
        total: length
    });

    return bar;
};
