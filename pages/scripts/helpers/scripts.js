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

  project.extend.helper.register('loadScripts', function() {

    //------------------------------

    var arr;
    var angularDeps = '';
    var angular_libs = this.config.angular_libs;

    //-------------------------------

    arr = _.uniqBy(angular_libs,'js');

    for (var lib of arr) {

      if (angularDeps.length) {
        angularDeps += ',';
      }

      if (lib.dep) {
        angularDeps += '\'' + lib.dep + '\'';
      }
    }


    return {
      angularDeps: angularDeps
    };
  });

  project.extend.helper.register('agnetaConfig', function() {

    var agneta = {
      page:{
        version: this.getVersion()
      },
      urls: {},
      keys: {},
      lang: this.site.lang,
      locale: this.site.locale,
      path: this.path_relative(),
      root: this.config.root,
      title: this.lng(this.config.title),
      server:{
        lib: this.site.servers.lib,
        media: this.site.servers.media,
        assets: this.site.servers.assets
      },
      services: {
        url: this.site.services.url,
        host: this.site.services.host,
        view: this.site.services.view,
        token: this.services_config('token').name
      },
      url_web: this.site.url_web,
      host: this.site.host_web,
      theme: {
        primary: this.config.colors.primary,
        accent: this.config.colors.accent
      }
    };

    var googleConfig = this.services_config('google');
    if(googleConfig){
      agneta.keys.googleAPI= googleConfig.api;
      agneta.keys.recaptcha= googleConfig.recaptcha;
    }

    if(this.config.search){
      agneta.urls.keywords = this.get_asset('generated/keywords_' + this.site.lang + '.json');
    }

    return `JSON.parse('${JSON.stringify(agneta)}')`;

  });


};
