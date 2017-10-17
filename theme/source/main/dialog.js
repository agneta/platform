/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/dialog.js
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
function _e_Dialog(app) {

  app.run(function($rootScope, $mdDialog) {

    ////////////////////////////////////////////////////////////////
    // Dialog History
    ////////////////////////////////////////////////////////////////

    $mdDialog._show = $mdDialog.show;

    $mdDialog.show = function(options) {

      if (options.nested) {
        var opt = options._options || options;
        opt.multiple = true;
        opt.skipHide = true;
      }

      options.clickOutsideToClose = true;
      options.preserveScope = true;
      options.autoWrap = true;
      options.parent = angular.element(document.body);

      return $mdDialog._show(options);

    };

    $mdDialog.open = function(options) {
      if (!options.partial) {
        options = {
          partial: options
        };
      }

      var locals = {};
      var path = agneta.urljoin(agneta.lang,'partial',options.partial);

      if (options.data) {
        locals.data = options.data;
      }

      $rootScope.loadingMain = true;
      $rootScope.loadData(path)
        .then(function(data) {

          if (data.extra) {
            locals.remote = data.extra;
          }

          var dialogOptions = {
            onRemoving: options.onRemoving,
            clickOutsideToClose: true,
            nested: options.nested,
            templateUrl: agneta.partial(options.partial),
            locals: locals
          };


          dialogOptions.controller = options.controller || data.controller || 'DialogController';
          $mdDialog.show(dialogOptions);
        })
        .finally(function() {
          $rootScope.loadingMain = false;
        });

    };

    $rootScope.dialog = $mdDialog.open;


  });


  app.controller('DialogController', function($scope, $mdDialog, data) {

    $scope.data = data;

  });

  app.controller('DialogCtrl', function($rootScope, $scope, $mdDialog) {
    $scope.close = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.next = function(data) {
      $mdDialog.hide(data);
    };

    $rootScope.$on('error', function() {
      $scope.loading = false;
    });
  });

  app.controller('DialogConfirm', function($rootScope, $scope, data, $mdDialog) {

    $scope.confirm = function() {
      if (data.onConfirm) {
        data.onConfirm();
      }
      $mdDialog.hide();
    };
    $scope.reject = function() {
      if (data.onReject) {
        data.onReject();
      }
      $mdDialog.hide();
    };

  });

}
