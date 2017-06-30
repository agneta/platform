module.exports = function(app) {
    return {
        initial: {
            "./middleware/limits/clear": {
                params: [app],
                paths: ['/limits/:name/clear']
            },
            "./middleware/limits/list": {
                params: [app],
                paths: ['/limits']
            },
        },
        "session": {
            "./middleware/session": {
                params: [app, {
                    secure: false
                }]
            }
        },
        "final:after": {
            "strong-error-handler": {
                "params": {
                    "debug": true
                }
            }
        }
    };
};
