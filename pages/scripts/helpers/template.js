const fs = require('fs-extra');
const ejs = require('ejs');
const _ = require('lodash');
const path = require('path');
const hash = require('object-hash');
const Mustache = require('mustache');

module.exports = function(locals) {

    var project = locals.project;
    Mustache.tags = ['${', '}'];

    project.extend.helper.register('render', function(template) {
        if (!_.isString(template)) {
            return template;
        }
        return Mustache.render(template, this);

    });

    project.extend.helper.register('template', function(path_partial, data, cache) {

        var content;
        var memCache = locals.cache.templates;

        if (cache) {

            content = memCache.get(path_partial);

            if (content) {
                //console.log('serving cached:', path_partial);
                return content;
            }
        }

        var file_path = project.theme.getTemplateFile(path_partial + '.ejs');
        if (!file_path) {
            throw new Error('Could not find template: ' + path_partial);
        }

        content = fs.readFileSync(file_path, 'utf8');
        content = ejs.render.apply(this, [content,
            _.extend(this, data, {
                locals: data || {}
            })
        ]);


        if (cache) {
            memCache.set(path_partial, content);
            //console.log('cache', memCache.length, memCache.itemCount);
        }

        return content;
    });

    project.extend.helper.register('has_template', function(req) {
        var path_partial = path.join(project.paths.base, "source", req + ".ejs");

        var res = this.is_file(path_partial);

        if (res) {
            return true;
        }

        path_partial = path.join(project.paths.baseTheme, "source", req + ".ejs");

        return this.is_file(path_partial);

    });

};
