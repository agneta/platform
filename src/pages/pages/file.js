/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/file.js
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
'use strict';

var fs = require('fs-extra');
var Promise = require('bluebird');

function File(data) {
  this.source = data.source;
  this.path = data.path;
  this.type = data.type;
  this.params = data.params;
  this.content = data.content;
  this.stats = data.stats;
}

function wrapReadOptions(options) {
  options = options || {};
  if (typeof options === 'string') options = {
    encoding: options
  };
  if (!options.hasOwnProperty('encoding')) options.encoding = 'utf8';
  if (!options.hasOwnProperty('cache')) options.cache = true;
  if (!options.hasOwnProperty('escape')) options.escape = true;

  return options;
}

File.prototype.read = function(options) {

  var self = this;
  var content = this.content;

  options = wrapReadOptions(options);

  return Promise.resolve()
    .then(function() {
      if (!options.cache || !content) {
        return fs.readFile(self.source, options);
      }

      var encoding = options.encoding;
      if (!encoding) return content;

      var result = content.toString(encoding);

      return result;
    });
};

File.prototype.stat = function(options) {

  options = options || {};

  var stats = this.stats;
  var cache = options.hasOwnProperty('cache') ? options.cache : true;
  var self = this;

  return Promise.resolve()
    .then(function() {
      if (stats && cache) return stats;

      return fs.stat(self.source);
    });
};


module.exports = File;
