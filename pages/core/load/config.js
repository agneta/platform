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

    var themeConfig;
    var websiteConfig;

    return fs.readFile(
      path.join(project.paths.theme.base, 'config.yml'),
      'utf8'
    )
      .then(function(content) {

        themeConfig = yaml.safeLoad(content);

        return fs.readFile(
          path.join(project.paths.app.website, 'config.yml'),
          'utf8'
        );
      })
      .then(function(content) {

        websiteConfig = yaml.safeLoad(content);

        // Get some configurations in the portal from the project
        if(locals.web){
          return fs.readFile(
            path.join(locals.web.project.paths.app.website, 'config.yml'),
            'utf8'
          )
            .then(function(content) {
              var projectConfig = yaml.safeLoad(content);
              projectConfig = _.pick(projectConfig,['languages']);
              _.extend(websiteConfig, projectConfig);
            });
        }

      })
      .then(function() {

        _.extend(project.config, merge(websiteConfig));
        function merge(config) {

          return _.mergeWith(themeConfig, config,
            function(objValue, srcValue) {
              if (_.isArray(objValue)) {
                return _.union(objValue, srcValue);
              }
            });

        }

      });

  }

  function init() {

    return Promise.resolve()
      .then(function() {

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
        var packageAgneta = require(
          path.join(project.paths.core.platform, 'package.json')
        );

        project.site.version = {
          node: process.versions.node,
          npm: child_process.execSync('npm --version').toString().split('\n')[0],
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
        project.site.lang_others = _.omit(project.site.languages, [project.site.lang]);

        //-------------------------------------------
        //

        if (project.config.services) {

          var viewPath;
          switch (project.site.env) {
            case 'local':
              viewPath = project.config.page.viewBase.local;
              break;
            default:
              viewPath = project.config.page.viewBase.default;
              break;
          }

          var servicesUrl = locals.services.get('services_url');

          if (!servicesUrl) {
            throw new Error('Services must have a url');
          }
          //console.log('servicesUrl',servicesUrl);
          var servicesParsed = url.parse(servicesUrl);

          project.site.services = {
            url: servicesUrl,
            host: servicesParsed.host,
            view: urljoin(servicesUrl, viewPath)
          };
          //console.log('pages:url_services', project.site.services.url);

        }

        //---------------------

        var storageConfig = locals.services.get('storage');
        var servers = storageConfig.buckets;
        project.site.servers = {};
        for (let key in servers) {
          let server = servers[key];
          let result = server.host;
          switch(storageConfig.provider){
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
      return preInit()
        .then(function() {
          return init();
        });
    }
  };

};
