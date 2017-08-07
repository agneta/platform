/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/scripts/helpers/media.js
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
const urljoin = require('url-join');
const request = require('request-promise');
const chalk = require('chalk');
const LRU = require('lru-cache');

const cache = LRU({
  maxAge: 3 * 60 * 1000,
});

module.exports = function(locals) {

  var project = locals.project;

  project.extend.helper.register('prv_media', function() {
    var args = Array.prototype.slice.call(arguments);
    var mediaPath = urljoin.apply(this, [project.config.media.base].concat(args));
    return media.call(
      this,
      project.site.services.url,
      mediaPath
    );
  });

  project.extend.helper.register('get_media', function() {
    return media.call(
      this,
      project.site.servers.media,
      urljoin.apply(this, arguments)
    );
  });

  function media(host, pathMedia) {

    pathMedia = urljoin(host, pathMedia);

    if (!cache.get(pathMedia)) {

      cache.set(pathMedia, true);

      request({
        method: 'HEAD',
        uri: pathMedia
      })
        .catch(function(err) {
          console.log(chalk.bgRed('MEDIA_ERROR ' + err.statusCode), pathMedia);
        });

    }

    return this.getVersion(pathMedia);

  }

  project.extend.helper.register('page_media', function(path, page) {
    page = page || this.page;
    return this.get_media(
      urljoin(
        project.config.media.storageRoot, this.pagePath(page), path
      )
    );
  });

  project.extend.helper.register('get_icon', function(name) {
    return this.get_media(urljoin('icons', name));
  });

  project.extend.helper.register('get_cover', function(page, options) {

    options = options || {};
    page = page || this.page;

    if (page.cover) {

      var cover = page.cover.__value;
      var size = options.size || cover.size || 'large';

      return this.get_media(cover.location, size);
    }

    var name = 'cover';

    if (_.isString(page.$cover)) {
      name = page.$cover;
    }

    return this.page_media(name);


  });
};
