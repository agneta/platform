/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/system/api.js
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
agneta.directive('AgSystemApi', function(API, $rootScope) {

  var vm = this;
  vm.model = {};
  vm.method = {};
  vm.load = function() {

    $rootScope.loadingMain = true;
    API.models(vm.query)
      .$promise
      .then(function(result) {
        vm.model.list = result.list;
      })
      .finally(function(){
        $rootScope.loadingMain = false;
      });

  };

  vm.model.select = function(model) {
    vm.model.selected = model;
    vm.model.schema = null;
    vm.method.list = null;

    API.model({
      name: model.name,
      project: vm.query.project
    })
      .$promise
      .then(function(result) {
        vm.method.list = result.list;
        vm.model.schema = result.schema;
      });
  };

  vm.load();

  vm.method.select = function(method) {
    vm.method.selected = method;
  };


});
