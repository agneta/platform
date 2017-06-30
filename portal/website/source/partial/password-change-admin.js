(function() {

    var app = angular.module('MainApp');

    app.controller('PassChangeAdminCtrl', function($scope, data, $rootScope, $controller, Account, LoopBackAuth) {
        //console.log(data);
        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));

        $scope.submitPassword = function() {

            $scope.loading = true;

            Account.changePasswordAdmin({
                    password: $scope.formPassFields.password_new,
                    accountId: data.account.id
                })
                .$promise
                .then(function(result) {

                    if (data.account.id == $rootScope.account.id) {
                        LoopBackAuth.clearUser();
                        LoopBackAuth.save();
                        $rootScope.me();
                    }

                })
                .finally(function() {
                    $scope.loading = true;
                    data.onFinally();
                });
        };
    });
})();
