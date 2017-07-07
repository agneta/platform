var _ = require('lodash');

module.exports = function(app) {

    var roles = app.get('roles');
    var roleKeys = _.keys(roles);
    var includeRoles = _.map(roleKeys, function(name) {
        return {
            relation: name,
            scope: {
                fields: ['id']
            }
        };
    });

    function rewriteUserLiteral(req, currentUserLiteral) {
        if (req.accessToken && req.accessToken.userId && currentUserLiteral) {
            // Replace /me/ with /current-user-id/
            var urlBeforeRewrite = req.url;
            req.url = req.url.replace(
                new RegExp('/' + currentUserLiteral + '(/|$|\\?)', 'g'),
                '/' + req.accessToken.userId + '$1');
            if (req.url !== urlBeforeRewrite) {
                debug('req.url has been rewritten from %s to %s', urlBeforeRewrite,
                    req.url);
            }
        }
    }

    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    var name = app.get('token').name;

    var options = {
        searchDefaultTokenKeys: false,
        cookies: [name],
        headers: [name],
        params: [name]
    };

    var currentUserLiteral = options.currentUserLiteral;
    if (currentUserLiteral && (typeof currentUserLiteral !== 'string')) {
        debug('Set currentUserLiteral to \'me\' as the value is not a string.');
        currentUserLiteral = 'me';
    }
    if (typeof currentUserLiteral === 'string') {
        currentUserLiteral = escapeRegExp(currentUserLiteral);
    }

    function middleware(req, res, next) {

        req.accessTokens = req.accessTokens || {};

        if (req.accessToken === undefined) {
            Object.defineProperty(req, "accessToken", {
                get: function() {
                  var key = req.app.get('token').name;
                    return req.accessTokens[key] || null;
                }
            });
        }
        app.models.AccessToken.findForRequest(req, options, function(err, token) {
            if (err) {
                return next(err);
            }

            if (!token) {
                return next();
            }

            app.models.Account.findById(token.userId, {
                    include: includeRoles,
                    fields: {
                        id: true
                    }
                })
                .then(function(account) {
                    if (!account) {
                        return next('Account not found from access token');
                    }

                    var roles = _.omit(account.__data, 'id');
                    roles = _.mapValues(roles, function(value) {
                        return value.id;
                    });

                    token = token.__data;
                    token.roles = roles;
                    req.accessTokens[name] = token || null;
                    rewriteUserLiteral(req, currentUserLiteral);

                    next(null,token);
                })
                .catch(next);
        });

    }

    app.token = {
        middleware: middleware
    };

    return middleware;

};
