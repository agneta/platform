var path = require('path');

module.exports = function(app) {

    var limiterOptions = [];
    var configLimiter = app.get('limiter');

    if (configLimiter.global) {
        limiterOptions.push({
            params: [app, {
                name: 'global',
                title: 'Global',
                isGlobal: true,
                options: configLimiter.global
            }],
            paths: [app.get("restApiRoot")]
        });
    }

    if (configLimiter.paths) {
        for (var limiter of configLimiter.paths) {
            limiterOptions.push({
                params: [app, limiter],
                paths: limiter.paths
            });
        }
    }

    return {
        "initial:before": {
            "loopback#favicon": {}
        },
        initial: {
            "compression": {},
            "cors": {
                params: {
                    origin: true,
                    credentials: true
                }
            },
            "cookie-parser": {
                "params": app.get("cookie_secret")
            },
            "helmet#xssFilter": {},
            "helmet#frameguard": {
                params: [
                    "deny"
                ]
            },
            "helmet#hsts": {
                params: {
                    maxAge: 0,
                    includeSubdomains: true
                }
            },
            "helmet#hidePoweredBy": {},
            "helmet#ieNoOpen": {},
            "helmet#noSniff": {},
            "helmet#noCache": {
                "enabled": false
            },
            "./middleware/limiter": limiterOptions,
            "./middleware/limits/clear": {
                params: [app],
                paths: ['/limits/:name/clear']
            },
            "./middleware/limits/list": {
                params: [app],
                paths: ['/limits']
            }
        },
        "initial:after": {},
        "session": {
            "./middleware/session": {
                params: [app]
            }
        },
        "parse": {
            "body-parser#json": {},
            "body-parser#urlencoded": {
                "params": {
                    "extended": true
                }
            }
        },
        "routes:before": {
            "./middleware/token": {
                params: [app]
            }
        },
        "routes": {
            "./middleware/log-request": {
                "params": [app.get("token")]
            },
            "./middleware/media-private": {
                "params": [app]
            },
            "./middleware/page-private": {
                "params": [app]
            },
            "loopback#rest": {
                "paths": [
                    app.get("restApiRoot")
                ]
            }
        },
        "routes:after": {},
        "files": {},
        "final": {},
        "final:after": {
            "strong-error-handler": {
                "params": {
                    "debug": false,
                    "log": true,
                    "includeStack": false
                }
            }
        }
    };

};
