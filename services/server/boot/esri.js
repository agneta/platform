var urljoin = require('url-join');
var _ = require('lodash');
var requestPromise = require('request-promise');

module.exports = function(app) {

    var config = app.get('esri');
    if (!config) {
        return;
    }
    var credentials = config.credentials;
    var endpoint = urljoin(config.endpoint, 'rest/services', config.app, 'FeatureServer/0/query');
    var access;

    function generateToken() {

        return requestPromise.post({
                uri: 'https://www.arcgis.com/sharing/rest/generateToken',
                json: true,
                form: {
                    username: credentials.username,
                    password: credentials.password,
                    f: 'json',
                    referer: app.get('host')
                }
            })
            .then(function(res) {
                access = res;
                //console.log('Access token loaded');
            });

    }

    function query(query) {

        function esriQuery() {
            return requestPromise.get({
                uri: endpoint,
                json: true,
                qs: _.extend({
                    inSr: 4326,
                    outSr: 4326,
                    f: 'json',
                    token: access.token
                }, query)
            });
        }

        return esriQuery()
            .then(function(result) {
                if (result.error) {
                    switch (result.error.code) {
                        case 498:
                        case 499:
                            return generateToken()
                                .then(esriQuery);
                        default:
                            throw result.error;
                    }
                }
                return result;
            });
    }

    app.gis.esri = {
        query: query
    };

    return generateToken();

};
