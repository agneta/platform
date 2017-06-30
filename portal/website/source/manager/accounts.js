(function() {

    var app = angular.module('MainApp');

    app.controller("AccountCtrl", function($scope, $rootScope, $routeParams, $mdToast, $mdDialog, Production_Account, Account, $location) {

        var AccountModel = Account;

        $scope.$on('productionMode', function(evt,enabled) {
            if (enabled) {
                AccountModel = Production_Account;
            } else {
                AccountModel = Account;
            }
            loadAccounts();
        });

        function loadAccounts() {

            AccountModel.recent({
                    limit: 10
                }).$promise
                .then(function(recent) {
                    $scope.accounts = recent;
                });

        }

        loadAccounts();

        function reloadAccount() {

            getAccount($scope.viewAccount.id);

        }

        function getAccount(id) {

            $location.search('account', id);

            AccountModel.get({
                    id: id
                })
                .$promise
                .then(function(account) {

                    $scope.viewAccount = account;

                    AccountModel.activitiesAdmin({
                            accountId: id,
                            unit: 'month',
                            aggregate: 'dayOfYear'
                        })
                        .$promise
                        .then(function(result) {
                            $scope.activities = result.activities;
                        });

                });
        }

        if ($routeParams.account) {
            getAccount($routeParams.account);
        }

        $scope.save = function() {
            AccountModel.update({
                    data: $scope.viewAccount
                })
                .$promise
                .then(function(response) {
                    reloadAccount();
                    loadAccounts();
                    $mdToast.show({
                        hideDelay: 5000,
                        position: 'bottom right',
                        templateUrl: 'toast-account.html'
                    });
                });
        };

        $scope.editRole = function(roleName) {

            var role = $scope.viewAccount.roles[roleName];

            $mdDialog.open({
                partial: 'role-' + roleName,
                data: {
                    accountId: $scope.viewAccount.id,
                    roleName: roleName
                }
            });

        };

        $scope.removeRole = function(role) {

            var confirm = $mdDialog.confirm()
                .title('Role Removal')
                .textContent('Are you sure you want to remove this role?')
                .ok('Yes')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function() {
                AccountModel.roleRemove({
                        id: $scope.viewAccount.id,
                        name: role,
                    })
                    .$promise
                    .then(function(response) {

                        reloadAccount();

                    });
            }, function() {});

        };

        $scope.addRole = function() {

            AccountModel.roles()
                .$promise
                .then(function(roles) {

                    $mdDialog.show({
                        controller: function($scope, $controller, data) {
                            $scope.data = data;

                            angular.extend(this, $controller('DialogCtrl', {
                                $scope: $scope
                            }));

                            $scope.submit = function() {

                                $scope.loading = true;

                                AccountModel.roleAdd({
                                        id: data.account.id,
                                        name: $scope.role
                                    })
                                    .$promise
                                    .finally(function() {

                                        $scope.loading = false;
                                        reloadAccount();

                                    });
                            };

                        },
                        clickOutsideToClose: true,
                        locals: {
                            data: {
                                roles: roles,
                                account: $scope.viewAccount
                            }
                        },
                        templateUrl: agneta.partial('role-add')
                    });

                });

        };

        $scope.change = function(account) {
            getAccount(account.id);
        };

        $scope.createAccount = function() {

            $mdDialog.show({
                controller: function($scope, $controller) {

                    angular.extend(this, $controller('DialogCtrl', {
                        $scope: $scope
                    }));

                    $scope.submit = function() {
                        $scope.loading = true;
                        AccountModel.new($scope.formSubmitFields);
                    };

                },
                templateUrl: agneta.partial('account-create'),
                clickOutsideToClose: true
            });

        };

        $scope.changePassword = function() {

            $mdDialog.open({
                partial: 'password-change-admin',
                data: {
                    onFinally: function() {
                        loadAccounts();
                    },
                    account: $scope.viewAccount
                }
            });

        };

        $scope.resendVerification = function() {
            AccountModel.resendVerification({
                email: $scope.viewAccount.email
            });
        };

        $scope.removeAccount = function() {

            var confirm = $mdDialog.confirm()
                .title('Account Removal')
                .textContent('Are you sure you want to remove this account?')
                .ok('Yes')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function() {
                AccountModel.remove({
                        id: $scope.viewAccount.id
                    })
                    .$promise
                    .then(function(response) {
                        loadAccounts();
                        $scope.viewAccount = null;
                        //console.log(response);
                    });
            }, function() {});

        };
    });

})();
