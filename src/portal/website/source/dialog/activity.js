/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/dialog/activity.js
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
/*global UAParser*/
/*global CodeMirror*/

var app = angular.module('MainApp');

app.directive('codeActivity', function($filter, $parse, $timeout) {
  return {
    restrict: 'A',
    scope: true,
    link: function(scope, element) {

      var myCodeMirror = CodeMirror.fromTextArea(element[0], {
        readOnly: true,
        lineWrapping: true,
        lineNumbers: true,
        mode: 'application/json',
        theme: 'monokai'
      });

      scope.$watch('data', function(newValue) {
        if (newValue) {
          myCodeMirror.setValue(
            JSON.stringify(newValue, null, 2)
          );
          $timeout(function() {
            myCodeMirror.refresh();
          }, 100);
        }
      });
    }
  };
});

agneta.directive('AgActivityCtrl', function($rootScope, $mdDialog, data) {

  var vm = this;

  agneta.extend(vm, 'AgDialogCtrl');

  vm.loading = true;

  data.Model_Item.details({
    id: data.activity.id
  })
    .$promise
    .then(function(result) {
      vm.loading = false;

      if (!result) {
        return;
      }

      vm.title = data.activity.title;
      vm.time = result.time;
      //------------------------------------------

      if (result.data.request) {

        var agent = result.data.request.agent;
        var parser = new UAParser();
        parser.setUA(agent);
        agent = parser.getResult();

        angular.extend(result.data.request, {
          browser: agent.browser.name + ' ' + agent.browser.major,
          device: agent.device.name,
          os: agent.os.name
        });

      }

      vm.data = result.data;


    });

});
