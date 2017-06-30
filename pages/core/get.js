var urljoin = require('url-join');
var path = require('path');
const Promise = require('bluebird');

module.exports = function(locals) {

    var project = locals.project;

    locals.app.get("/", function(req, res, next) {
        var url = '/' + urljoin(project.config.root, project.config.language.default.key);
        url = path.normalize(url);
        res.redirect(url);
    });

    locals.app.get("/:lang*", function(req, res, next) {

        var target = req.params[0];
        var lang = req.params.lang;
        locals.app.renderPage(target, lang)
            .then(function(content) {

                if (!content) {
                    return next();
                }

                res.send(content);

            })
            .catch(next);
    });

    locals.app.renderPage = function(target, lang) {
        var dataPath = lang + target;

        return Promise.resolve()
            .then(function() {
                var language = project.site.languages[lang];

                if (!language) {
                    throw new Error('Incorrect language ', lang);
                }

                project.site.lang = lang;

                //-----------------------------------------------------------

                var data = project.getPage(target).data;

                if (!data) {
                    throw new Error('No Data found for ' + target);
                }

                //-----------------------------------------------------------

                if (data.if && !project.config[data.if]) {
                    throw new Error('Page does not meet condition');
                }

                //-----------------------------------------------------------

                return project.execFilter('before_post_render', data, {
                    context: project
                });

            })
            .then(function(data) {

                if (!data) {
                    throw new Error('No Data to render');
                }

                data.pathLang = dataPath;
                return locals.renderData(data);

            });
    };

};
