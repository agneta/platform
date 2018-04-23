/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/lib/locals.js
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
const _ = require('lodash');
const path = require('path');
const urljoin = require('url-join');

module.exports = function(app, options) {

  //console.log('options',options);
  options = options || {};

  var env = options.env || process.env.NODE_ENV || app.web.services.get('env');
  var baseDir = options.dir || process.env.PROJECT_DIR || process.cwd();

  if (options.include && !_.isArray(options.include)) {
    options.include = [options.include];
  }
  options.include = options.include || [];

  for(var name in options.paths.app.extensions){
    var extPaths = options.paths.app.extensions[name];
    options.include.push(extPaths.services);
  }

  app.set('env', env);
  app.set('website_dir', path.join(baseDir, 'website'));
  app.set('services_dir', path.join(baseDir, 'services'));
  app.set('options', options);
  app.set('services_include', options.include);
  app.set('root', options.root);

  //---------------------------------------------
  // Merge Config

  var configurator = require('./configurator')(app);
  var config = configurator.load('config');

  for (var key in config) {
    var data = config[key];
    var source = app.web.services.get(key);
    if (source && _.isObject(source)) {
      data = _.extend(source, data);
    }
    app.set(key, data);
  }

  //---------------------------------------------
  // Website URL

  var webOpts = options.website || {};
  var website = {
    host: webOpts.host || app.web.services.get('web_url') || process.env.ENDPOINT,
    root: webOpts.root
  };

  website.url = urljoin(website.host, website.root||'');
  //console.log('services:url_web',website.url);
  app.set('website', website);

  //---------------------------------------------

  switch (env) {
    case 'development':
    case 'local':

      var services_url = urljoin( website.host, options.root||'');
      console.log(services_url);
      app.set('services_url', services_url);
      break;
  }

  //-------------------------------------------
  // Origins

  var allowOrigins = [
    website.host
  ];

  app.set('allowOrigins', allowOrigins);

  //-------------------------------------------
  // Search names

  var configSearch = app.web.services.get('search');

  for (let name in configSearch) {
    let options = configSearch[name];

    //-----------------------------------------------------------

    _.defaults(options,{
      models:{}
    });

    let source = options.model || options.models.source;

    if(!source){
      throw new Error(`Source is missing from search config with name: ${name}`);
    }

    _.defaults(options.models,{
      position: `${source}_Search_Position`,
      field: `${source}_Search_Field`,
      keyword: `${source}_Search_Keyword`
    });

    options.models.source = source;

  }

  //-------------------------------------------
  // Storage

  require('./storage')({
    app:app,
    options: options
  });
};
