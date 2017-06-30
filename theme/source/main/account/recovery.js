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
