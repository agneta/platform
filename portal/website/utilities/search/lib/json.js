var Promise = require('bluebird');
var path = require('path');
var _ = require('lodash');
var fs = require('fs-extra');
var outputJson = Promise.promisify(fs.outputJson);

module.exports = function(util, options) {

    var webProject = util.locals.web.project;

    return function(data) {

        data = data || {};

        var lang = data.language;
        var keywords = _.keys(util.keywords.dict);
        var filename = options.filename({
            language: lang
        }) + '.json';
        var filePath = path.join(options.outputJson || webProject.paths.generated, filename);

        return outputJson(filePath, keywords)
            .then(function() {
                util.success(keywords.length + ' keywords are written to: ' + filePath);
            });
    };
};
