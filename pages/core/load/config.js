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
var yaml = require('js-yaml');
var path = require('path');
var url = require('url');
var urljoin = require('url-join');
var fs = require('fs-extra');
var Promise = require('bluebird');
var readFile = Promise.promisify(fs.readFile);
var _ = require('lodash');

module.exports = function(locals) {

  var project = locals.project;

  return function() {

    var themeConfig;
    var websiteConfig;

    return readFile(
      path.join(project.paths.baseTheme, 'config.yml'),
      'utf8'
    )
      .then(function(content) {

        themeConfig = yaml.safeLoad(content);

        return readFile(
          path.join(project.paths.base, 'config.yml'),
          'utf8'
        );
      })
      .then(function(content) {

        websiteConfig = yaml.safeLoad(content);

        _.extend(project.config, merge(websiteConfig));

        function merge(config) {

          return _.mergeWith(themeConfig, config,
            function(objValue, srcValue) {
              if (_.isArray(objValue)) {
                return _.union(objValue, srcValue);
              }
            });

        }

        //------------------------------------------
        //

        var hostPath = locals.services.get('website') || {};
        hostPath = hostPath.host || locals.host;

        if (!hostPath) {
          throw new Error('Must have a URL for the website');
        }

        project.site.host_web = hostPath;
        project.site.url_web = urljoin(project.site.host_web, project.config.root);

        //console.log('pages:url_web', project.site.url_web);

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

        project.site.lang = project.config.language.default.key;

        var languages = [project.config.language.default];

        if (project.config.language.extra) {
          languages = languages.concat(project.config.language.extra);
        }

        project.config.languages = languages;

        //---------------------

        var servers = locals.services.get('storage').buckets;

        project.site.servers = {};
        for (var key in servers) {
          var server = servers[key];
          project.site.servers[key] = project.site.protocol + '//' + server.host;
        }

        //-------------------------------------------
        //

        if (project.config.services) {

          var servicesUrl;
          var viewPath;
          switch (locals.env) {
          case 'local':
            viewPath = project.config.page.viewBase.local;
            break;
          default:
            viewPath = project.config.page.viewBase.default;
            break;
          }
          switch (locals.env) {
          case 'development':
          case 'local':
            servicesUrl = urljoin(hostPath, locals.url_services);
            break;
          default:

            var servicesDomain = locals.services.get('domain');

            if (servicesDomain) {
              servicesUrl = project.site.protocol + '//' + servicesDomain;
            }

            break;
          }

          var servicesParsed = url.parse(servicesUrl);

          project.site.services = {
            url: servicesUrl,
            host: servicesParsed.host,
            view: urljoin(servicesUrl, viewPath)
          };
          //console.log('pages:url_services', project.site.services.url);

        }


      });

  };
};
