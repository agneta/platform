(function() {

    app.controller('PassLostCtrl', function($scope, $controller, Account, $mdDialog) {

        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));

        $scope.submit = function() {
            $scope.loading = true;
            Account.requestPassword($scope.passLostFields, function(result) {

                $scope.loading = false;

            });
        };

    });

    app.controller('PassChangeCtrl', function($scope, $rootScope, $mdDialog, $controller, LoopBackAuth, Account) {

        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));

        $scope.submitPassword = function() {

            $scope.loading = true;

            Account.passwordChange($scope.formPassFields)
                .$promise
                .then(function(res) {

                    $scope.loading = false;
                    var credentials = {
                        email: res.email,
                        password: $scope.formPassFields.password_new
                    };
                    $rootScope.signIn(credentials);

                });

        };

    });

})();
