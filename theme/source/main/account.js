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

/*global  _e_login*/
/*global  _e_password*/
/*global  _e_popup*/
/*global  _e_recovery*/
/*global  _e_root*/
/*global  _e_verification*/
/*global  _e_directives*/

(function() {

  var app = window.angular.module('MainApp');
  var tokenName = '_t_configServices("token").name;';

  app.config(function(LoopBackResourceProvider) {
    LoopBackResourceProvider.setAuthHeader(tokenName);
    var url = agneta.urljoin(agneta.services.url, 'api');
    LoopBackResourceProvider.setUrlBase(url);

  });

  _t_template('main/account/login');
  _t_template('main/account/password');
  _t_template('main/account/popup');
  _t_template('main/account/recovery');
  _t_template('main/account/root');
  _t_template('main/account/verification');
  _t_template('main/account/directives');

  _e_login(app);
  _e_password(app);
  _e_popup(app);
  _e_recovery(app);
  _e_root(app);
  _e_verification(app);
  _e_directives(app);

})();
