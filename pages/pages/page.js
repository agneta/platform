/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/page.js
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
var common = require('./common');
var pathFn = require('path');
var util = require('hexo-util');
var Pattern = util.Pattern;
var postDir = 'source/';
var draftDir = '_drafts/';

function startsWith(str, prefix) {
  return str.substring(0, prefix.length) === prefix;
}

exports.parseFilename = parseFilename;


exports.process = function(file) {
  return processPost.call(this, file);
};

exports.pattern = new Pattern(function(path) {
  if (common.isTmpFile(path)) return false;

  var result;

  if (startsWith(path, postDir)) {
    result = {
      published: true,
      path: path.substring(postDir.length)
    };
  } else if (startsWith(path, draftDir)) {
    result = {
      published: false,
      path: path.substring(draftDir.length)
    };
  } else {
    return false;
  }

  if (common.isHiddenFile(result.path)) return false;
  return result;
});

function processPost(data) {

  /* jshint validthis: true */
  var Page = this.model('Page');
  var self = this;
  var path = parseFilename(data.path);

  var doc = Page.findOne({
    path: path
  });

  data.path = path;

  if (data.if && !self.config[data.if]) {
    return;
  }

  if (!data.title) {
    data.title = {
      en: pathFn.parse(data.path).name
    };
  }

  if (doc) {
    return doc.replace(data);
  } else {
    return Page.insert(data);
  }
}

function parseFilename(path) {

  path = path.substring(0, path.length - pathFn.extname(path).length);
  path = pathFn.normalize(path);
  if (path[0] != '/') {
    path = '/' + path;
  }
  return path;
}
