/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/pages/extend/migrator.js
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

function Migrator(){
  this.store = {};
}

Migrator.prototype.list = function(){
  return this.store;
};

Migrator.prototype.get = function(name){
  return this.store[name];
};

Migrator.prototype.register = function(name, fn){
  if (!name) throw new TypeError('name is required');
  if (typeof fn !== 'function') throw new TypeError('fn must be a function');

  if (fn.length > 1){
    fn = Promise.promisify(fn);
  } else {
    fn = Promise.method(fn);
  }

  this.store[name] = fn;
};

module.exports = Migrator;