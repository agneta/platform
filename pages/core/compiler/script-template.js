/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/core/compiler/script-template.js
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
const loaderUtils = require('loader-utils');

module.exports = function(source) {

  var loaderOptions = loaderUtils.getOptions(this) || {};

  return _.template(source, {
    interpolate: /\$\$template\.(.+?);/g
  })({
    configServices: function(name,configPath){
      var result = loaderOptions.locals.services.get(name);
      if(configPath){
        result = _.get(result,configPath);
      }
      result = JSON.stringify(result);
      return `JSON.parse('${result}');`;
    }
  });

};
