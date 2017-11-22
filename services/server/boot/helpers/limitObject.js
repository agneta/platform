/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/server/boot/helpers/limitObject.js
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

module.exports = function(data, options) {

  var depth = options.depth || 3;

  function check(collection, options) {

    //console.log('depthIndex',options.depth,depth);
    var newCollection;
    if (_.isObject(collection)) {
      newCollection = {};
    }

    if (_.isArray(collection)) {
      newCollection = [];
    }

    if (!newCollection) {
      return collection;
    }

    if (options.depth > depth) {
      return;
    }

    var keys = _.keys(collection);

    keys.map(function(key) {
      var value = collection[key];

      if (_.isFunction(value)) {
        return;
      }
      var checkValue = check(value, {
        depth: options.depth + 1
      });
      if (!_.isUndefined(checkValue)) {
        newCollection[key] = checkValue;
      }
    });

    if (!_.size(newCollection)) {
      return;
    }
    return newCollection;
  }

  return check(data, {
    depth: 1
  });
};
