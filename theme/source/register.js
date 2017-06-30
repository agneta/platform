(function() {

    angular.module('MainApp').controller("RegisterCtrl", function($scope, Account, $mdDialog) {

        $scope.registerAccount = function() {

            $scope.loading = true;

            Account.register($scope.registerFields)
                .$promise
                .finally(function() {
                    $scope.loading = false;
                });
        };

    });

})();
