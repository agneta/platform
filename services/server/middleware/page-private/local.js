const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

module.exports = function(app) {

    var client = app.get('options').client;
    var project = client.project;

    return function(data) {

        var pagePath = path.join(project.paths.build, 'local', 'private', data.remotePath,'index.html');

        if (!fs.existsSync(pagePath)) {
            return Promise.reject({
                notfound: true
            });
        }

        var readStream = fs.createReadStream(pagePath);

        data.res.set('Content-Encoding','gzip');
        data.res.set('Content-Type','text/html; charset=utf-8');
        
        readStream.pipe(data.res);

    };

};
