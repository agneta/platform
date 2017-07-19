/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/extend/renderer.js
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

var pathFn = require('path');
var Promise = require('bluebird');

function getExtname(str){
  var extname = pathFn.extname(str) || str;
  return extname[0] === '.' ? extname.slice(1) : extname;
}

function Renderer(){
  this.store = {};
  this.storeSync = {};
}

Renderer.prototype.list = function(sync){
  return sync ? this.storeSync : this.store;
};

Renderer.prototype.get = function(name, sync){
  var store = this[sync ? 'storeSync' : 'store'];

  return store[getExtname(name)] || store[name];
};

Renderer.prototype.isRenderable = function(path){
  return Boolean(this.get(path));
};

Renderer.prototype.isRenderableSync = function(path){
  return Boolean(this.get(path, true));
};

Renderer.prototype.getOutput = function(path){
  var renderer = this.get(path);
  return renderer ? renderer.output : '';
};

Renderer.prototype.register = function(name, output, fn, sync){
  if (!name) throw new TypeError('name is required');
  if (!output) throw new TypeError('output is required');
  if (typeof fn !== 'function') throw new TypeError('fn must be a function');

  name = getExtname(name);
  output = getExtname(output);

  if (sync){
    this.storeSync[name] = fn;
    this.storeSync[name].output = output;

    this.store[name] = Promise.method(fn);
  } else {
    if (fn.length > 2) fn = Promise.promisify(fn);
    this.store[name] = fn;
  }

  this.store[name].output = output;
};

module.exports = Renderer;