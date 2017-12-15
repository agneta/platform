/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/deploy/pages/index.js
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
module.exports = function(util) {

  var build = require('./build')(util);
  //var db = require('./db')(util);

  return function(options) {

    if (!options.source.pages) {
      return;
    }

    util.log('Deploying pages...');

    switch (options.target) {
      case 'production':

        return build.production()
          .then(function(){
            //return db.production();
          });

      case 'staging':

        return build.staging()
          .then(function(){
            //return db.staging();
          });
    }

  };
};
