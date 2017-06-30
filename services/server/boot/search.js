module.exports = function(app) {

    var init = require('./search/init')(app);
    var config = app.get('search');

    for (var name in config) {
        var options = config[name];
        search = init(options);
    }
};
