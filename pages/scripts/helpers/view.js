/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/view.js
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
var urljoin = require('url-join');
var _ = require('lodash');

module.exports = function(locals) {

  var project = locals.project;

  project.extend.helper.register('viewBasicData', function() {

    var data = {};
    var site = this.site;
    var page = this.page;

    data.title = this.get_title(page);
    data.path = page.pathSource;
    data.scripts = [];
    data.styles = [];
    data.languages = [];

    //-----------------------------------------------------
    // languages

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

      var linkClass = (lang_short == site.lang) ? 'selected' : '';

      data.languages.push({
        name: lang_full,
        href: url,
        linkClass: linkClass
      });
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

    data.layoutClass = [
      'page-' + page.templateSource.split('/').join('-')
    ];
    if (page.class) {
      data.layoutClass.push(page.class);
    }
    data.layoutClass = data.layoutClass.join(' ');

    //----------------------------------------------------

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


    return data;


  });


  project.extend.helper.register('viewAuthData', function() {

    var data = this.viewBasicData();
    return JSON.stringify(data);

  });


  project.extend.helper.register('viewData', function() {

    var data = this.viewBasicData();

    var page = this.page;
    var config = this.config;
    var self = this;

    data.authorization = page.authorization;
    data.keypress = page.keypress;
    data.controller = page.controller;
    data.menuLock = config.lockSidebar || page.menuLock;
    data.extra = this.lngScan(page.viewData);

    //----------------------------------------

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

    return JSON.stringify(data);

  });

};
