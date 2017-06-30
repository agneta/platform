(function() {
    app.controller('ResendVrfCtrl', function($scope, Account, $controller, $mdDialog, data) {

        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));

        $scope.data = {
            title: 'Warning',
            content: data.html,
            action: {
                title: 'Resend Verification'
            }
        };

        $scope.action = function() {
            $scope.loading = true;
            Account.resendVerification({
                email: data.email
            });
        };

    });
})();
