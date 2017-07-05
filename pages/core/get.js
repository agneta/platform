const urljoin = require('url-join');
const path = require('path');
const Promise = require('bluebird');
const _ = require('lodash');

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

                var languages = _.get(project, 'site.languages');
                if (!languages) {
                    return;
                }

                var language = languages[lang];

                if (!language) {
                    return;
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
                    return;
                }

                data.pathLang = dataPath;
                return locals.renderData(data);

            });
    };

};
