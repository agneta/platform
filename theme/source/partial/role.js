(function() {

    var app = window.angular.module('MainApp');

    app.controller('FormRole', function($scope, $controller, data, Account) {

        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));

        $scope.loading = true;
        $scope.formRoleFields = {};

        function load() {

            Account.roleGet({
                    accountId: data.accountId,
                    roleName: data.roleName
                })
                .$promise
                .then(function(role) {
                    for (var key in role) {
                        $scope.formRoleFields[key] = role[key];
                    }
                })
                .finally(function() {
                    $scope.loading = false;
                });

        }

        load();

        $scope.update = function() {
            $scope.loading = true;
            Account.roleEdit({
                accountId: data.accountId,
                roleName: data.roleName,
                data: $scope.formRoleFields
            });
        };

    });

})();
