/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/manager/history.js
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

  agneta.directive('AgHistoryCtrl', function($ocLazyLoad, $rootScope, $mdDialog, $mdSidenav, $timeout, Production_Activity_Count, Activity_Count, Production_Activity_Item, Portal, Activity_Item) {

    var vm = this;

    var Model_Count = $rootScope.isProduction() ? Production_Activity_Count : Activity_Count;
    var Model_Item = $rootScope.isProduction() ? Production_Activity_Item : Activity_Item;

    var formats = {
      month: 'MMMM',
      dayOfYear: 'ddd DD',
      hourOfYear: 'ha'
    };

    vm.$on('productionMode', function(evt, enabled) {
      if (enabled) {
        Model_Count = Production_Activity_Count;
        Model_Item = Production_Activity_Item;
      } else {
        Model_Count = Activity_Count;
        Model_Item = Activity_Item;
      }
      vm.loadTotals();
    });

    //-----------------------------------------

    vm.page = {
      feedSelected: null
    };
    vm.type = 'view_page';

    //-----------------------------------------

    (function() {

      var yearCurrent = (new Date()).getFullYear();
      vm.years = [];
      for(var i=0;i<5;i++){
        vm.years.push(yearCurrent-i);
      }
      vm.page.yearSelected = vm.years[0];

    })();

    //-----------------------------------------

    vm.selectFeed = function(feed) {
      vm.page.feedSelected = feed;
      vm.loadTotals();
    };

    //-----------------------------------------

    var shared = {
      Model_Count: Model_Count,
      Model_Item: Model_Item,
      Portal: Portal,
      formats: formats,
      vm: vm,
      $mdDialog: $mdDialog
    };

    require('manager/history/load.module')(shared);
    require('manager/history/export.module')(shared);
    require('manager/history/filters.module')(shared);
    require('manager/history/navigation.module')(shared);


  });



})();
