/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/account/recovery.js
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

    app.controller('AccountRecoverCtrl', function($scope, $controller, Account, $mdDialog) {

        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));

        $scope.submitPassword = function() {

            $scope.loading = true;

            Account.recover($scope.formPassFields, function(res) {
                $scope.loading = false;

            });

        };

    });

    app.controller('RequestRecoveryCtrl', function($scope, Account, $controller, $mdDialog, email) {

        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));

        $scope.data = {
            title: 'Account Deactivated',
            content: 'This Account was deactivated and can be recovered with an email verification.',
            action: {
                title: 'Recover Account'
            }
        };

        $scope.action = function() {

            $scope.loading = true;

            Account.requestRecovery({
                email: email
            });
        };

    });

})();
