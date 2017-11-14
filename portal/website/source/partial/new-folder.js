/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/partial/new-folder.js
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

  var app = angular.module('MainApp');

  app.controller('NewFolder', function($controller, $scope, $rootScope, data) {

    angular.extend(this, $controller('DialogCtrl', {
      $scope: $scope
    }));

    $scope.apply = function(){
      data.onApply($scope.name)
        .then(function(){
          $scope.close();
        });
    };

  });

})();
