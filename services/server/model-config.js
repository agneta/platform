var path = require('path');
var _ = require('lodash');

module.exports = function(app) {

    var servicesDir = app.get('services_dir');
    var servicesInclude = app.get('services_include');

    var sources = [
        "loopback/common/models",
        "loopback/server/models"
    ];

    return {
        _meta: {
            sources: sources,
            mixins: [
                "loopback/common/mixins",
                "loopback/server/mixins",
                "../../node_modules/loopback-ds-timestamp-mixin",
                "../../../loopback-ds-timestamp-mixin",
                "../common/mixins",
                "./mixins"
            ]
        },
        User: {
            dataSource: "db",
            public: false
        },
        Role_Administrator: {
            dataSource: "db",
            public: true
        },
        Role_Reviewer: {
            dataSource: "db",
            public: false
        },
        Role_Editor: {
            dataSource: "db",
            public: false
        },
        AccessToken: {
            dataSource: "db",
            public: false
        },
        ACL: {
            dataSource: "db",
            public: false
        },
        RoleMapping: {
            dataSource: "db",
            public: false
        },
        Role: {
            dataSource: "db",
            public: false
        },
        AccountRole: {
            dataSource: "db",
            public: false
        },
        Account: {
            dataSource: "db",
            public: true,
            options: {
                emailVerificationRequired: true
            }
        },
        Activity_Item: {
            dataSource: "db",
            public: true
        },
        Activity_Feed: {
            dataSource: "db",
            public: true
        },
        Activity_Count: {
            dataSource: "db",
            public: true
        },
        Form: {
            dataSource: "db",
            public: true
        },
        Search_Page: {
            dataSource: "db",
            public: true
        },
        Limiter: {
            dataSource: false,
            public: true
        },
        Session: {
            dataSource: "db",
            public: false
        }
    };

};
