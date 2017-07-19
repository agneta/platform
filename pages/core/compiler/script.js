/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/compiler/script.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
var path = require('path');
var fs = require('fs-extra');
var ejs = require('ejs');
var _ = require('lodash');
var babel = require("babel-core");

module.exports = function(locals) {

    var project = locals.project;

    function js(path_partial, data) {
        return this.template(path_partial + '.js', data);
    }

    function template(path_partial, data) {

        var path_result;

        if (path_partial.indexOf(project.paths.source) === 0 ||
            path_partial.indexOf(project.paths.sourceTheme) === 0) {
            path_result = path_partial;
        } else {
            path_result = project.theme.getFile(path.join('source', path_partial));
        }

        if (!path_result) {
            var msg = 'Template not found: ' + path_partial;
            console.error(msg);
            throw new Error(msg);
        }

        var file_content = fs.readFileSync(path_result, 'utf8');

        var result = ejs.render.apply(this, [file_content,
            _.extend(this, data, {
                locals: data,
            })
        ]);
        return result;

    }

    var helpers = {
        path: function(req) {
            return locals.app.locals.get_path(req);
        },
        js: js,
        configServices: function(prop) {
            return locals.services.get(prop);
        },
        config: function(prop) {
            return _.get(project.config, prop);
        },
        template: template
    };

    var babelOptions = {
        presets: [
            ["env", {
                targets: {
                    browsers: ["ie >= 10"]
                }
            }]
        ]
    };

    function middleware(req, res, next) {
        var parsedPath = path.parse(req.path);

        switch (parsedPath.ext) {
            case '.js':

                var path_partial = project.theme.getFile(path.join('source', req.path));

                if (path_partial) {
                    var content = compile(req.path, {
                        useBabel: true
                    });
                    res.setHeader('content-type', 'application/javascript');
                    res.end(content);
                    return;
                }
                break;
            default:
        }
        next();
    }

    function compile(path_partial, options) {

        options = options || {};
        options.babel = options.babel || {};

        var content = template(path_partial, helpers);

        if (false && options.useBabel) {
            content = babel.transform(content,
                _.extend({}, babelOptions, options.babel)
            );
            content = content.code;
        }

        return content;
    }

    return {
        middleware: middleware,
        compile: compile
    };
};
