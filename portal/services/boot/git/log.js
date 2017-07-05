var Promise = require('bluebird');

module.exports = function(app) {

    var config = app.get('git');

    app.git.log = function(options) {

        var filePath;
        if (options.file) {
            filePath = app.git.getPath(options.file);
        }

        return app.git.native.log({
                file: filePath
            })
            .then(function(result) {

                var authorConfig = config.authors || {};

                return Promise.map(result.all, function(commit) {
                    var author = authorConfig[commit.author_email];
                    if (author) {

                        var map = author.map;
                        if (map) {
                            commit.author_email = map.email;
                            commit.author_name = map.name;
                        }
                    }
                    commit.date = new Date(commit.date).toISOString();
                    return commit;

                });
            });
    };

};
