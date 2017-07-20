/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/partial/activity-form.js
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

  app.controller('ActivityFormCtrl', function($controller, $scope, $rootScope, data, Form, Production_Form) {

    angular.extend(this, $controller('DialogCtrl', {
      $scope: $scope
    }));

    $scope.loading = true;
    var Model = $rootScope.isProduction() ? Production_Form : Form;

    data.Model_Item.details({
      id: data.activity.id
    })
      .$promise
      .then(function(result) {
        if (!result.data.formId) {
          return result;
        }
        return Model.load({
          id: result.data.formId
        })
          .$promise;

      })
      .then(function(result) {
        result.time = result.time || result.createdAt;
        $scope.activity = result;
      })
      .finally(function() {
        $scope.loading = false;
      });

  });

})();
