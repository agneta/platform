var path = require('path');
var urljoin = require('url-join');
var _ = require('lodash');

module.exports = function(locals) {

    var project = locals.project;

    project.extend.helper.register('viewData', function() {

        var data = {};
        var page = this.page;
        var site = this.site;
        var config = this.config;
        var self = this;

        data.title = this.get_title(page);
        data.authorization = page.authorization;
        data.path = page.pathSource;
        data.keypress = page.keypress;
        data.controller = page.controller;
        data.menuLock = config.lockSidebar || page.menuLock;
        data.extra = this.lngScan(page.viewData);
        data.languages = [];
        data.scripts = [];
        data.styles = [];

        if (page.toolbar && this.has_template(path.join('partials', page.toolbar))) {
            data.toolbar = this.get_path(urljoin('partial', page.toolbar));
        }

        //----------------------------------------

        var sidebarName = page.templateSource + '.sidebar';
        if (this.has_template(sidebarName)) {
            data.sidebar = this.get_path(urljoin(this.pagePath(page), 'sidebar'));
        }

        //----------------------------------------

        if (page.angular_libs) {
            data.dependencies = _.map(page.angular_libs, function(value) {
                return {
                    dep: value.dep,
                    js: self.get_asset(value.js + '.js')
                };
            });
        }

        //----------------------------------------

        data.layoutClass = [
            'page-' + page.templateSource.split('/').join('-')
        ];
        if (page.class) {
            data.layoutClass.push(page.class);
        }
        data.layoutClass = data.layoutClass.join(' ');

        if (page.scripts) {
            var pageScripts = this.lngScan(page.scripts);
            for (var y in pageScripts) {
                var script = pageScripts[y];
                if (_.isString(script)) {
                    script += '.js';
                }
                var asset = this.get_asset(script);
                if (asset) {
                    data.scripts.push(asset);
                }
            }
        }

        if (page.styles) {
            for (var style of page.styles) {
                data.styles.push(this.get_asset(style + '.css'));
            }
        }

        if (page.has_photoswipe) {
            data.styles.push(this.get_lib("photoswipe/photoswipe.css"));
            data.styles.push(this.get_lib("photoswipe/default-skin.css"));
            data.scripts.push(this.get_lib("photoswipe/photoswipe.min.js"));
            data.scripts.push(this.get_lib("photoswipe/photoswipe-ui-default.min.js"));
            data.scripts.push(this.get_asset("js/photoswipe.init.js"));
        }

        //----------------------------------------

        if (page.parent) {
            var parent = project.site.pages.findOne({
                parentName: page.parent
            });
            if (parent) {
                data.parentPath = this.get_path(parent);
            }
        }

        if (!data.parentPath) {
            data.parentPath = this.get_path('/');
        }

        if (page.templateSource == 'home') {
            data.parentPath = null;
        }

        //----------------------------------------

        var templateStyle = this.layout_style({
            source: true,
            template: page.templateSource
        });

        if (templateStyle) {
            data.styles.push(templateStyle);
        }

        //----------------------------------------

        var templateScript = this.layout_script({
            source: true,
            template: page.templateSource
        });

        if (templateScript) {
            data.scripts.push(templateScript);
        }

        for (var lang_short in site.languages) {

            if (page.title && !page.title[lang_short]) {
                continue;
            }

            var lang_full = site.languages[lang_short];

            var url = page.pathSource;
            url = url.split('/');
            url.unshift(lang_short);
            url = url.join('/');
            url = this.url_for(url);

            var linkClass = (lang_short == site.lang) ? "selected" : "";

            data.languages.push({
                name: lang_full,
                href: url,
                linkClass: linkClass
            });
        }
        return JSON.stringify(data);

    });

};
