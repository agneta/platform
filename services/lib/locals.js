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

  var env = options.env || process.env.NODE_ENV || app.get('env');
  var baseDir = options.dir || process.env.PROJECT_DIR || process.cwd();

  if (options.include && !_.isArray(options.include)) {
    options.include = [options.include];
  }

  app.set('env', env);
  app.set('website_dir', path.join(baseDir, 'website'));
  app.set('services_dir', path.join(baseDir, 'services'));
  app.set('options', options);
  app.set('services_include', options.include || []);
  app.set('root', options.root);

  //---------------------------------------------

  switch (env) {
    case 'development':
    case 'local':

      var services_url = urljoin('/', options.root);
      if (services_url.indexOf('//') == 0) {
        services_url = services_url.substring(1);
      }

      app.set('services_url', services_url);
      break;
  }


  //---------------------------------------------
  // Merge Config

  var configurator = require('./configurator')(app);
  var config = configurator.load('config');

  for (var key in config) {
    var data = config[key];
    var source = app.get(key);
    if (source && _.isObject(source)) {
      data = _.extend(source, data);
    }
    app.set(key, data);
  }

  //---------------------------------------------
  // Website URL

  var webOpts = options.website || {};
  var website = {
    host: webOpts.host || app.get('web_url') || process.env.ENDPOINT,
    root: webOpts.root
  };

  website.url = urljoin(website.host, website.root);
  //console.log('services:url_web',website.url);
  app.set('website', website);

  //-------------------------------------------
  // Origins

  var allowOrigins = [
    website.host
  ];

  app.set('allowOrigins', allowOrigins);

  //-------------------------------------------
  // Search names

  var configSearch = app.get('search');

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

  var configName = 'storage';
  var storageConfig = app.get(configName);

  if (!storageConfig) {
    app.set(configName, {});
    storageConfig = app.get(configName);
  }

  var domain = options.web || options.client;

  if (domain) {
    domain = domain.project.config.domain.production;

    var buckets = {
      media: {
        staging: `media-staging.${domain}`,
        private: `media-private.${domain}`,
        production: `media.${domain}`
      },
      pages: {
        staging: `staging-private.${domain}`,
        production: `private.${domain}`
      },
      assets: {
        staging: `assets-staging.${domain}`,
        production: `assets.${domain}`
      }
    };

    switch (env) {
      case 'production':
        buckets.media.host = buckets.media.production;
        buckets.pages.host = buckets.pages.production;
        buckets.assets.host = buckets.assets.production;
        break;
      default:
        buckets.media.host = buckets.media.staging;
        buckets.pages.host = buckets.pages.staging;
        buckets.assets.host = buckets.assets.staging;
        break;
    }
  }

  storageConfig.buckets = buckets;

};
