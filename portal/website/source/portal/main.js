/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/portal/main.js
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
    var logLimit = 3000;

    app.run(function($rootScope, $mdToast, Portal) {

        $rootScope.notify = function(options) {
            $mdToast.show(
                $mdToast.simple()
                .textContent(options.message)
                .position('bottom left')
                .hideDelay(3000)
            );
        };

        Portal.socket.on('activity:new', function(activity) {

            var message = 'Activity: ';
            message += activity.account.name || activity.account.email;
            message += ' ' + activity.action_value;

            $mdToast.show(
                $mdToast.simple()
                .textContent(message)
                .position('bottom right')
                .hideDelay(3000)
            );

        });


    });

    app.controller('LiveToggleCtrl', function($scope, $rootScope) {

        $scope.value = false;

        $rootScope.isProduction = function() {
            return $scope.value;
        };

        if (!$rootScope.account.administrator) {
            $scope.value = true;
            return;
        }

        $scope.onChange = function(value) {
            $scope.value = value;
            $rootScope.$broadcast('productionMode', value);
        };


    });

    app.component('memoryUsage', {
        templateUrl: 'memory-usage.html',
        bindings: {
            update: '&'
        },
        controller: function($scope, Portal) {
            var ctrl = this;

            this.$onInit = function() {

                Portal.socket.on('memory:update', function(update) {
                    ctrl.update = update;
                    $scope.$apply();
                });
            };
        }
    });


})();
