module.exports = function(app, options) {
    return function(req, res, next) {

        var result = [];
        for (var name in app.locals.limiters) {
            var limiter = app.locals.limiters[name];
            result.push({
                name: limiter.name,
                title: limiter.title
            });
        }

        res.send(result);
    };
};
