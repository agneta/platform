/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/scripts.js
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
var _ = require('lodash');

module.exports = function(locals) {
  var project = locals.project;

  function deps() {
    //------------------------------

    var result = [];
    var arr = [].concat(
      project.config.angular_libs,
      project.config.scripts.lib,
      project.config.scripts.app
    );

    //-------------------------------
    for (var lib of arr) {
      if (!lib) {
        continue;
      }
      if (lib.dep) {
        result.push(lib.dep);
      }
    }

    result = _.uniqBy(result);

    return result;
  }

  project.extend.helper.register('agnetaConfig', function() {
    var self = this,
      pagePath;
    return Promise.resolve()
      .then(function() {
        return self.path_relative();
      })
      .then(function(_pagePath) {
        pagePath = _pagePath;
      })
      .then(function() {
        var agneta = {
          page: {
            version: self.getVersion()
          },
          urls: {},
          keys: {},
          deps: deps(),
          lang: self.site.lang,
          locale: self.site.locale,
          path: pagePath,
          root: self.config.root,
          title: self.lng(self.config.title),
          env: self.services_config('env'),
          server: {
            lib: self.site.servers.lib,
            media: self.site.servers.media,
            assets: self.site.servers.assets
          },
          services: {
            url: self.site.services.url,
            host: self.site.services.host,
            view: self.site.services.view,
            token: self.services_config('token').name
          },
          url_web: self.site.url_web,
          host: self.site.host_web,
          theme: {
            primary: self.config.colors.primary,
            accent: self.config.colors.accent
          }
        };

        var googleConfig = self.services_config('google');
        if (googleConfig) {
          agneta.keys.googleAPI = googleConfig.api;
          agneta.keys.recaptcha = googleConfig.recaptcha;
        }

        if (self.config.search) {
          agneta.urls.keywords = self.get_asset(
            'generated/keywords_' + self.site.lang + '.json'
          );
        }

        return `JSON.parse('${JSON.stringify(agneta)}')`;
      });
  });
};
