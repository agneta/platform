const _ = require("lodash");
const path = require("path");
const S = require("string");
const Promise = require('bluebird');

module.exports = function(app) {

    _.omitDeep = function(collection, excludeKeys) {

        function omitFn(value) {

            if (value && typeof value === 'object') {
                excludeKeys.forEach((key) => {
                    delete value[key];
                });
            }
        }

        return _.cloneDeepWith(collection, omitFn);

    };

    app.helpers = {
        mixin: function(name, Model) {
            require("../server/mixins/" + name)(Model);
        },
        omitDeep: _.omitDeep,
        mediaType: function(mimeType) {

            var typeParsed = mimeType.split('/');
            var mimetype = typeParsed[0];
            var mediatype = typeParsed[1];

            var type = mimetype;

            switch (mimetype) {
                case 'image':
                    switch (mediatype) {
                        case 'jpeg':
                        case 'png':
                            type = 'image';
                            break;
                        case 'svg+xml':
                            type = 'icon';
                            break;
                        default:

                    }
                    break;
                case 'application':
                    switch (mediatype) {
                        case 'pdf':
                            type = 'pdf';
                            break;
                    }
                    break;
                default:

            }

            return type;
        },
        fixPath: function(pagePath) {
            pagePath = path.normalize(pagePath);
            pagePath = pagePath.split('/');
            if (!pagePath[0].length) {
                pagePath.shift();
            }
            if (!pagePath[pagePath.length - 1].length) {
                pagePath.pop();
            }
            for (var i in pagePath) {
                pagePath[i] = S(pagePath[i]).slugify().s;
            }
            return pagePath.join('/');
        },
        dropCollection: function(names) {

            names = _.isArray(names) ? names : [names];

            var db = app.dataSources.db.connector.db;

            return Promise.resolve()
                .then(function() {
                    return db.listCollections()
                        .toArray();
                })
                .then(function(list) {
                    return Promise.map(names, function(name) {

                        if (_.find(list, {
                                name: name
                            })) {
                            return db.collection(name).drop();
                        }

                    });
                })
                .then(function() {
                    return app.indexes.autoupdate(names);
                });

        },
        resubmitPassword: function(ctx, user, next) {

            var accessToken = ctx.req.accessToken;

            // Skip password confirmation for short term tokens
            if (accessToken.ttl < 1000) {
                return next();
            }

            var body = ctx.req.body;
            var password = body.password || body.password_old;

            if (!password) {
                return next({
                    code: 'CONFIRM_PASS_REQUIRED',
                    message: 'Password is required'
                });
            }

            app.models.Account.findById(accessToken.userId)
                .then(function(currentUser) {
                    return currentUser.hasPassword(password);
                })
                .then(function(isMatch) {
                    if (!isMatch) {
                        return next({
                            code: 'CONFIRM_PASS_WRONG',
                            message: 'Could not confirm your request because you entered a wrong password'
                        });
                    }
                    next();
                })
                .catch(next);
        }

    };
};
