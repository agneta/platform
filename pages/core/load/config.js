/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/load/config.js
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
const yaml = require('js-yaml');
const path = require('path');
const url = require('url');
const urljoin = require('url-join');
const fs = require('fs-extra');
const Promise = require('bluebird');
const _ = require('lodash');
const child_process = require('child_process');

module.exports = function(locals) {
  var project = locals.project;

  function preInit() {
    var configDirs = [
      project.paths.app.frontend.base,
      project.paths.app.website
    ];

    if (locals.web) {
      configDirs.push(locals.web.project.paths.appPortal.website);
    }

    return Promise.each(configDirs, function(dir) {
      var configPath = path.join(dir, 'config.yml');

      return fs.exists(configPath).then(function(exists) {
        if (!exists) {
          return;
        }
        return fs.readFile(configPath).then(function(content) {
          var config = yaml.safeLoad(content);
          project.config = _.mergeWith(project.config, config, function(
            objValue,
            srcValue
          ) {
            if (_.isArray(objValue)) {
              return _.union(objValue, srcValue);
            }
          });
        });
      });
    });
  }

  function init() {
    return Promise.resolve().then(function() {
      var websiteConfig = locals.services.get('website') || {};
      var hostPath = websiteConfig.host || locals.host;
      //console.log('config:hostPath',hostPath);

      if (!hostPath) {
        throw new Error('Must have a URL for the website');
      }

      project.site.host_web = hostPath;
      project.site.url_web = websiteConfig.url;

      //console.log('pages:url_web', project.site.url_web);

      //---------------------
      var packageAgneta = require(path.join(
        project.paths.core.platform,
        '..',
        'package.json'
      ));

      project.site.version = {
        node: process.versions.node,
        npm: child_process
          .execSync('npm --version')
          .toString()
          .split('\n')[0],
        agneta: packageAgneta.version
      };

      //---------------------

      var hostParsed = url.parse(project.site.host_web);

      project.site.env = project.env;
      project.site.port = hostParsed.port;
      project.site.portal = locals.portal && !locals.building;
      project.site.building = locals.buildOptions ? true : false;
      project.site.protocol = hostParsed.protocol;
      project.config.root = locals.root || '/';
      //console.log('pages:project:env', project.site.env);

      //---------------------

      var languages = [project.config.language.default];

      if (project.config.language.extra) {
        languages = languages.concat(project.config.language.extra);
      }

      project.config.languages = languages;

      project.site.languages = {};

      for (var language of project.config.languages) {
        project.site.languages[language.key] = language;
      }

      project.site.lang = project.config.language.default.key;
      project.site.lang_others = _.omit(project.site.languages, [
        project.site.lang
      ]);

      //-------------------------------------------
      //

      if (project.config.services) {
        var viewPath;
        var servicesUrl = locals.services.get('services_url');

        if (!servicesUrl) {
          throw new Error('Services must have a url');
        }
        //console.log('servicesUrl',servicesUrl);
        var servicesParsed = url.parse(servicesUrl);

        switch (project.site.env) {
          case 'local':
            viewPath = project.config.page.viewBase.local;
            console.log('servicesParsed', servicesParsed, servicesUrl);
            //servicesUrl =
            break;
          default:
            viewPath = project.config.page.viewBase.default;
            break;
        }

        project.site.services = {
          url: servicesUrl,
          host: servicesParsed.host,
          view: urljoin(servicesUrl, viewPath)
        };
        //console.log('pages:url_services', project.site.services.url);
      }

      //---------------------

      var storageConfig = locals.services.web.services.get('storage');
      var servers = storageConfig.buckets;
      project.site.servers = {};
      for (let key in servers) {
        let server = servers[key];
        let result = server.host;
        switch (storageConfig.provider) {
          case 'local':
            result = `localhost:${storageConfig.port}/${result}.ag`;
            break;
        }
        result = project.site.protocol + '//' + result;
        project.site.servers[key] = result;
      }

      switch (project.site.env) {
        case 'development':
        case 'local':
          project.site.servers.assets = project.site.url_web;
          break;
      }
    });
  }

  return {
    init: init,
    preInit: preInit,
    load: function() {
      return preInit().then(function() {
        return init();
      });
    }
  };
};
