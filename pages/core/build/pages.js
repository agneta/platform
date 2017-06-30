const ejs = require('ejs');
const _ = require('lodash');
const Promise = require('bluebird');
const minify = require('html-minifier').minify;
const fs = require('fs');
const path = require('path');
const Minimize = require('minimize');
const htmlclean = require('htmlclean');
const zlib = require('zlib');

const gzip = Promise.promisify(zlib.gzip);

module.exports = function(locals, options) {

    var logger = options.logger;
    var app = locals.app;
    var project = locals.project;
    var exportFile = locals.exportFile.init;

    var minimize = new Minimize({
        empty: true,
        cdata: true,
        comments: false,
        ssi: true,
        conditionals: false,
        spare: true,
        quotes: true,
        loose: false,
        dom: {
            xmlMode: true,
            lowerCaseAttributeNames: false,
            lowerCaseTags: false
        }
    });

    ///////////////////////////////////////////////////////

    project.site._build = true;

    return Promise.each(project.config.languages, function(language) {

        if (language.skipBuild) {
            return;
        }

        var lang = language.key;

        project.site.lang = lang;
        project.call_listeners('ready');

        logger.log('Building on Language: ' + language.value + '(' + project.site.lang + ')');


        ///////////////////////////////////////////////////////
        // Prepare paths to Generate
        ///////////////////////////////////////////////////////

        var generate_data = [];
        var pages_skipped = [];
        var pages_no_lang = [];

        project.site.pages.map(function(data) {

            ///////////////////////////////////////////////////////
            // FILTER UNWANTED PAGES
            ///////////////////////////////////////////////////////

            if (!data.barebones) {

                if (!app.locals.has_lang(data)) {
                    pages_no_lang.push(data.path);
                    return;
                }

            }

            if (data.skip) {
                pages_skipped.push(data.path);
                return;
            }

            if (data.if && !project.config[post.if]) {
                pages_skipped.push(data.path);
                return;
            }

            generate_data.push(data);

        });

        //--------------------------------------------------
        // Add root page

        var indexPage = project.site.pages.findOne({
            path: '/'
        });
        generate_data.push(_.extend({}, indexPage, {
            _rootPath: true
        }));

        //----------------------------------------------------
        // Display Statistics before building

        logger.log('No Language on ' + pages_no_lang.length + ' pages');
        logger.log('Skipped ' + pages_skipped.length + ' pages');
        logger.log('Generating ' + generate_data.length + ' paths:');

        var bar = options.progress(generate_data.length, {
            title: 'Pages'
        });

        return Promise.resolve()
            .delay(20)
            .then(function() {

                return Promise.map(generate_data, function(data) {

                    //-----------------------------------------------
                    // GENERATE HTML

                    bar.tick({
                        title: data.path
                    });

                    var html_rendered = locals.renderData(data);

                    //-----------------------------------------------
                    // MINIFY HTML

                    if (project.config.minify && project.config.minify.html) {
                        minimize.parse(html_rendered, function(error, html_minified) {

                            html_minified = htmlclean(html_minified);
                            return outputHtml(html_minified);

                        });
                    } else {
                        return outputHtml(html_rendered);
                    }

                    function outputHtml(html) {

                        var data_path = data.path;

                        //-------------------------------

                        var outputPath;
                        var path_parsed = path.parse(data_path);

                        switch (path_parsed.ext) {
                            case '':
                                outputPath = path.join(data_path, 'index.html');
                                break;
                            default:
                                outputPath = path.join(path_parsed.dir, path_parsed.base);
                                break;
                        }

                        if (!data._rootPath) {
                            outputPath = path.join(lang, outputPath);
                        }

                        if (outputPath[0] == '/') {
                            outputPath = outputPath.substring(1);
                        }

                        //----------------------------------
                        // gzip

                        return gzip(
                                new Buffer(html, 'utf-8')
                            )
                            .then(function(html) {
                                return exportFile({
                                    path: outputPath,
                                    data: html
                                });
                            });


                    }


                }, {
                    concurrency: 3
                });

            });
    });
};
