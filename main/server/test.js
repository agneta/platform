const chai = require('chai');
const chaiHttp = require('chai-http');
const klaw = require('klaw');
const path = require('path');
const Promise = require('bluebird');

chai.should();
chai.use(chaiHttp);

return Promise.resolve()
    .then(function() {
        require('./portal')();
    })
    .then(function() {

        var pathTests = path.join('test');
        var walker = klaw(pathTests);

        walker.on('data', function(item) {

            if (item.stats.isDirectory()) {
                return;
            }

            var path_parsed = path.parse(item.path);

            switch (path_parsed.ext) {
                case '.js':
                    //require(item.path)(options);
                    break;
            }


        });

        return new Promise(function(resolve, reject) {
            walker.on('end', resolve);
            walker.on('error', reject);
        });

    });
