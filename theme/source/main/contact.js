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

    var app = window.angular.module('MainApp');

    app.controller('ContactCtrl', function($rootScope, $scope, $mdDialog) {

        $scope.open = function() {
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: agneta.partial('contact'),
                controller: 'ContactDialogCtrl'
            });
        };

    });

    app.controller('ContactDialogCtrl', function($rootScope, $scope, $timeout, $controller, $mdDialog, Contact) {

        $scope.tabSelected = 0;

        $scope.isTabActive = function(index) {
            return index == $scope.tabSelected;
        };

        $scope.onTabSelected = function(index) {
            $scope.tabSelected = index;
        };

        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));

        $scope.select = function(name) {
            $scope.selected = name;
            $timeout(function() {
                $scope.tabSelected = 1;
            }, 100);
        };

        $scope.send = function(name) {
            var fields = $scope[name+'Fields'];
            //console.log(fields);
            $scope.loading = true;
            Contact[name](fields)
                .$promise
                .finally(function() {
                    $scope.loading = false;
                });
        };


    });


})();
