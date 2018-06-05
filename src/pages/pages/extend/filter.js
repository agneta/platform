/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/extend/filter.js
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

var Promise = require('bluebird');

var typeAlias = {
  pre: 'before_post_render',
  post: 'after_post_render'
};

function Filter(){
  this.store = {};
}

Filter.prototype.list = function(type){
  if (!type) return this.store;
  return this.store[type] || [];
};

Filter.prototype.register = function(type, fn, priority){
  if (!priority){
    if (typeof type === 'function'){
      priority = fn;
      fn = type;
      type = 'after_post_render';
    }
  }

  if (typeof fn !== 'function') throw new TypeError('fn must be a function');

  type = typeAlias[type] || type;
  priority = priority == null ? 10 : priority;

  var store = this.store[type] = this.store[type] || [];

  fn.priority = priority;
  store.push(fn);

  store.sort(function(a, b){
    return a.priority - b.priority;
  });
};

Filter.prototype.unregister = function(type, fn){
  if (!type) throw new TypeError('type is required');
  if (typeof fn !== 'function') throw new TypeError('fn must be a function');

  var list = this.list(type);
  if (!list || !list.length) return;

  for (var i = 0, len = list.length; i < len; i++){
    if (list[i] === fn){
      list.splice(i, 1);
      break;
    }
  }
};

Filter.prototype.exec = function(type, data, options){
  options = options || {};

  var filters = this.list(type);
  var ctx = options.context;
  var args = options.args || [];

  args.unshift(data);

  return Promise.each(filters, function(filter){
    return Promise.method(filter).apply(ctx, args).then(function(result){
      args[0] = result == null ? data : result;
      return args[0];
    });
  }).then(function(){
    return args[0];
  });
};

Filter.prototype.execSync = function(type, data, options){
  options = options || {};

  var filters = this.list(type);
  var ctx = options.context;
  var args = options.args || [];
  var result;

  args.unshift(data);

  for (var i = 0, len = filters.length; i < len; i++){
    result = filters[i].apply(ctx, args);
    args[0] = result == null ? data : result;
  }

  return args[0];
};

module.exports = Filter;