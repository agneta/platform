(function() {
    app.controller('PopupLoginCtrl', function($rootScope, $scope, $mdDialog, $controller) {

        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));

        $scope.submit = function() {

            var email = $scope.formLoginFields.email;
            var password = $scope.formLoginFields.password;

            $scope.loading = true;

            $rootScope.signIn({
                    email: email,
                    password: password
                },
                function() {

                    $scope.loading = false;
                    $mdDialog.hide();

                });
        };

    });
})();
