/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/account.module.js
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

  app.config(function(LoopBackResourceProvider) {
    LoopBackResourceProvider.setAuthHeader(agneta.services.token);
    var url = agneta.urljoin(agneta.services.url, 'api');
    LoopBackResourceProvider.setUrlBase(url);

  });

  app.directive('agAccountAvatar', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        if (!ngModel) return;
        scope.$watch(attrs.ngModel, function(account) {
          if(!account){
            return;
          }
          var picture = account.picture;
          if(account.picturePrivate){
            picture = agneta.prv_media(account.picturePrivate,'small');
          }
          scope.picture = picture;
        });

      }
    };
  });


  require('main/account/params.module');
  require('main/account/methods.module');
  require('main/account/directives.module');

})();
