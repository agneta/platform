/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/middleware.js
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
var path = require('path');
var chalk = require('chalk');

module.exports = function(app) {

  var config = {
    'routes:before': {}
  };

  var enableAuth = process.env.DISABLE_AUTH ? false : true;
  if(!enableAuth){
    console.log(chalk.bgYellow('Portal Authorization is disabled.'));
  }
  config['routes:before'][path.join(__dirname, 'middleware/auth-portal')] = {
    params: [app],
    enabled: enableAuth
  };

  return config;
};
