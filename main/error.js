module.exports = {
    config: function(key, env) {
        var msg = 'Missing config: ' + key + '.';
        if (env) {
            msg += ' You can also set an environment variable: ' + env + '.';
        }
        throw msg;
    }
};
