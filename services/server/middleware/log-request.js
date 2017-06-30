var loopback = require('loopback');
var _ = require('lodash');

////////////////////////////////////////////////////////////////////////
//  Log Request
////////////////////////////////////////////////////////////////////////

module.exports = function(token) {

    var hideMap = {
        password_new: '***********',
        password_old: '***********',
        password: '***********',
    };

    hideMap[token.name] = '***************';


    return function(req, res, next) {

        var params = {};
        switch (req.method) {
            case 'GET':
                params = req.query;
                break;
            case 'POST':
                params = req.body;
                break;
        }

        params = _.extend({},params);

        for(var key in params){
            var value = hideMap[key];
            if(value){
                params[key] = value;
            }
        }

        var data = {
            hostname: req.hostname,
            ip: req.ip || req.connection.remoteAddress,
            agent: req.headers['user-agent'],
            method: req.method,
            params: params,
            path: req.path,
            protocol: req.protocol,
        };

        req.dataParsed = data;

        next();
    };
};
