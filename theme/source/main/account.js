/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/account.js
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

(function() {

  var app = window.angular.module('MainApp');
  var tokenName = '_t_configServices("token").name;';

  app.config(function(LoopBackResourceProvider) {
    LoopBackResourceProvider.setAuthHeader(tokenName);
    var url = agneta.urljoin(agneta.services.url, 'api');
    LoopBackResourceProvider.setUrlBase(url);

  });

  require('main/account/login');
  require('main/account/password');
  require('main/account/popup');
  require('main/account/recovery');
  require('main/account/root');
  require('main/account/verification');
  require('main/account/directives');

})();
