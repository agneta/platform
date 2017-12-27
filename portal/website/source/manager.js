/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/manager.js
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

  agneta.directive('AgHomeCtrl', function($rootScope, $location, Account) {

    var vm = this;
    vm.accounts = {};
    vm.activities = {};

    $rootScope.$on('accountCheck', function(event, account) {
      if (account) {
        init();
      }
    });

    if ($rootScope.account) {
      init();
    }

    function init() {

      Account.total({}).$promise
        .then(function(res) {
          vm.accounts.count = res.count;
        });

      Account.recent({
        limit: 5
      }).$promise
        .then(function(recent) {
          vm.accounts.recent = recent.list;
        });

    }

    vm.openAccount = function(account) {
      $location.path(agneta.langPath('manager/accounts')).search({
        account: account.id
      });
    };

  });

  agneta.directive('AgHomeActivitiesCtrl', function($rootScope, $q, $timeout) {
    ///////////////////////////////////////////

    var vm = this;
    vm.feeds = {};
    vm.periodSelected = 'dayOfYear';

    vm.onPeriodChange = function() {

      vm.promises = [];
      vm.$broadcast('periodChanged');
      vm.progressMode = 'indeterminate';

      $q.all(vm.promises)
        .then(function() {
          vm.progressMode = 'determinate';
          //console.log('dooone');
        });
    };

    $timeout(vm.onPeriodChange, 100);

  });

  app.directive('agnetaHomeFeed', function(Activity_Count) {

    return {
      link: function(vm, $element, $attrs) {

        vm.$on('periodChanged', init);

        function init() {

          var promise = Activity_Count.totals({
            feed: $attrs.name,
            period: vm.periodSelected
          }).$promise
            .then(function(res) {

              vm.feeds[$attrs.name] = res.count;

            });

          vm.promises.push(promise);

        }
      }
    };
  });


})();
