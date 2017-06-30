module.exports = function(app, options) {
    return function(req, res, next) {

        var limiter = app.locals.limiters[req.params.name];
        if (!limiter) {
            return res.send({
                error: 'Limiter not found'
            });
        }

        limiter.reset(req.ip, null, function() {
            res.send('Cleared Limits on: ' + limiter.title);
        });
    };
};
