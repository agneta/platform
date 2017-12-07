/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/manager/history/users.js
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

  var moment = window.moment;
  var angular = window.angular;
  var app = angular.module('MainApp');

  app.directive('visUser', function() {

    return {
      link: function(vm, $element) {
        vm.createTimeline({
          $element: $element,
          getTitle: getTitle,
          dialogController: 'AgLogUserCtrl',
          template: 'log-user'
        });
      }
    };
  });

  app.agDirective('AgLogUserCtrl', function($mdDialog, result) {

    var vm = this;

    agneta.extend(vm, 'AgDialogCtrl');


    vm.fromNow = moment.utc(result.time).local().fromNow();


  });


  function getTitle() {

    var title = '';
    return title;

  }

})();
