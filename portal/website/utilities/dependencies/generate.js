var extract = require('./extract');
var path = require('path');

module.exports = function(util) {

    var projectPaths = util.locals.web.project.paths;

    return extract(util, {
            name: 'theme',
            base: projectPaths.baseTheme,
            root: projectPaths.baseTheme
        })
        .then(function() {
            return extract(util, {
                name: 'portal',
                base: path.join(projectPaths.portal, 'website'),
                root: projectPaths.portal
            });
        })
        .then(function() {
            return extract(util, {
                name: 'project',
                base: projectPaths.base,
                root: process.cwd()
            });
        });

};
