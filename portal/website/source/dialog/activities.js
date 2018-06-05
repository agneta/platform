/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/dialog/activities.js
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
/*global moment*/

agneta.directive('AgActivitiesCtrl', function($rootScope, $mdDialog, data) {

  var vm = this;

  agneta.extend(vm, 'AgDialogCtrl');

  vm.loading = true;
  var time = moment().utc().dayOfYear(data.value);
  vm.time = time;


  data.Model_Item.latest(data)
    .$promise
    .then(function(result) {
      vm.loading = false;
      vm.data = result;
    });

  vm.modal = function(activity) {
    $mdDialog.open({
      nested: true,
      partial: activity.modal,
      data: {
        activity: activity,
        Model_Item: data.Model_Item
      }
    });
  };

  vm.loadActivity = function(activity) {

    $mdDialog.open({
      nested: true,
      partial: 'activity',
      data: {
        activity: activity,
        Model_Item: data.Model_Item
      },
      controller: 'AgActivityCtrl'
    });

  };

});
