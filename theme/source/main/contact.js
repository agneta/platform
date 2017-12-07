/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/contact.js
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

  agneta.directive('AgContactCtrl', function($rootScope, $mdDialog) {

    var vm = this;

    vm.open = function() {
      $mdDialog.show({
        clickOutsideToClose: true,
        templateUrl: agneta.dialog('contact'),
        controller: 'AgContactDialogCtrl'
      });
    };

  });

  agneta.directive('AgContactDialogCtrl', function($rootScope, $timeout, $mdDialog, Contact) {

    var vm = this;

    vm.tabSelected = 0;

    vm.isTabActive = function(index) {
      return index == vm.tabSelected;
    };

    vm.onTabSelected = function(index) {
      vm.tabSelected = index;
    };

    agneta.extend(vm, 'AgDialogCtrl');

    vm.select = function(name) {
      vm.selected = name;
      $timeout(function() {
        vm.tabSelected = 1;
      }, 100);
    };

    vm.send = function(name) {
      var fields = vm[name+'Fields'];
      //console.log(fields);
      vm.loading = true;
      Contact[name](fields)
        .$promise
        .finally(function() {
          vm.loading = false;
        });
    };


  });


})();
