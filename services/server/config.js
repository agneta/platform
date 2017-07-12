module.exports = {
    restApiRoot: "/api",
    host: "locahost",
    domain: 'locahost',
    token: {
        name: 'access_token'
    },
    roles: {
        administrator: {
            model: 'Role_Administrator'
        },
        reviewer: {
            model: 'Role_Reviewer'
        },
        editor: {
            model: 'Role_Editor'
        }
    },
    limiter: {
        global: {
            freeRetries: 100,
            attachResetToRequest: false,
            refreshTimeoutOnRequest: false,
            minWait: 10 * 60 * 1000,
            maxWait: 1 * 60 * 60 * 1000,
            lifetime: 10 * 60,
        }
    },
    search: {
        page: {
            models: {
                position: 'Search_Position',
                source: 'Search_Page',
                field: 'Search_Field',
                keyword: 'Search_Keyword'
            }
        }
    },
    remoting: {
        rest: {
            normalizeHttpPath: false,
            xml: false
        },
        json: {
            strict: false,
            limit: "100kb"
        },
        urlencoded: {
            extended: true,
            limit: "100kb"
        },
        cors: false
    },
    media: require('./config/media'),
    activities: require('./config/activities'),
    legacyExplorer: false
};
