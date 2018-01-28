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
  var helpers = locals.app.locals;

  project.extend.helper.register('viewController', function(tag) {
    tag = tag.split('-');
    var result = [];
    for (var item of tag) {
      item = item[0].toUpperCase() + item.slice(1);
      result.push(item);
    }
    result = result.join('');
    return result;
  });

  project.extend.helper.register('viewTag', function(page) {
    page = page || this.page;

    var tag = page.controller;
    if (tag) {
      tag = tag.replace(/([a-z](?=[A-Z]))/g, '$1 ').split(' ').join('-').toLowerCase();
    } else {
      if (page.isDialog) {
        tag = 'ag-dialog-ctrl';
      } else {
        tag = 'ag-page' + (page.pathSource || page.path).split('/').join('-').toLowerCase();
        if (tag[tag.length - 1] == '-') {
          tag += 'home';
        }
      }
    }

    return tag;

  });

  project.extend.helper.register('viewBasicData', function(page) {

    var data = {};
    var site = this.site;
    page = page || this.page;

    data.title = this.get_title(page);
    data.path = page.pathSource;
    data.parentPath = page.parentPath;
    data.scripts = [];
    data.styles = [];
    data.languages = [];

    page.controller = page.controller || this.viewController(this.viewTag(page));

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

    data.layoutClass = [
      'page-' + page.templateSource.split('/')
        .join('-')
    ];
    if (page.class) {
      data.layoutClass.push(page.class);
    }
    data.layoutClass = data.layoutClass.join(' ');

    //----------------------------------------------------

    var templateStyle = this.layout_style(page.templateSource);

    if (templateStyle) {
      data.styles.push(templateStyle);
    }

    var sourceStyle = this.layout_style(page.pathSource);

    if (sourceStyle) {
      data.styles.push(sourceStyle);
    }

    //----------------------------------------

    var templateScript = this.layout_script(page.templateSource);

    if (templateScript) {
      data.scripts.push(templateScript);
    }

    var sourceScript = this.layout_script(page.pathSource);

    if (sourceScript) {
      data.scripts.push(sourceScript);
    }

    return data;


  });


  project.extend.helper.register('viewAuthData', function(page) {

    page = page || this.page;
    page = _.extend(_.pick(page,[
      'title',
      'path',
      'pathSource',
      'templateSource'
    ]),{
      class: 'page-authorization'
    });
    var data = getData(page);
    data.dependencies = [
      [
        this.get_asset('authorization.css')
      ]
    ];
    return JSON.stringify(data);

  });


  project.extend.helper.register('viewData', function(page) {

    page = page || this.page;
    return JSON.stringify(getData(page));

  });

  function getData(page) {
    var data = helpers.viewBasicData(page);

    var config = helpers.config;
    var self = helpers;

    data.authorization = page.authorization;
    data.keypress = page.keypress;
    data.controller = page.controller;
    data.menuLock = config.lockSidebar || page.menuLock;
    data.extra = helpers.lngScan(page.viewData);

    //----------------------------------------

    if (page.toolbar && helpers.has_template(path.join('partials', page.toolbar))) {
      data.toolbar = helpers.get_path(urljoin('partial', page.toolbar));
    }

    //----------------------------------------

    if (page.angular_libs) {
      data.inject = _.map(page.angular_libs, function(value) {
        data.scripts.push(value.js);
        return value.dep;
      });
    }

    //----------------------------------------

    var tmpDependencies = [];
    data.dependencies = [];

    data.scripts = data.scripts.concat(page.scripts);
    data.styles = data.styles.concat(page.styles);

    setAssets(data.scripts, '.js');
    setAssets(data.styles, '.css');

    for (var index in tmpDependencies) {
      var value = tmpDependencies[index];
      value = _.uniq(value);
      data.dependencies.push(value);
    }

    delete data.scripts;
    delete data.styles;

    function setAssets(assets, ext) {
      for (var y in assets) {

        var asset = assets[y];
        var priority = 999;
        var assetPath = asset;

        if (!asset) {
          continue;
        }

        if (_.isObject(asset)) {
          assetPath = asset.path;
          priority = _.isNumber(asset.priority) ? asset.priority : priority;
        }

        if (!_.isString(assetPath)) {
          console.error(asset);
          throw new Error('Could not find asset path');
        }

        if (assetPath.indexOf(ext) < 0) {
          assetPath += ext;
        }

        assetPath = self.get_asset(assetPath);

        if (!assetPath) {
          throw new Error(`Could not find asset ${asset}`);
        }

        var dependencies = tmpDependencies[priority] || [];
        dependencies.push(assetPath);
        tmpDependencies[priority] = dependencies;

      }

    }

    return data;
  }

};
