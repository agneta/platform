(function() {

    var agneta = window.agneta;
    var angular = window.angular;
    var app = angular.module('MainApp');

    app.controller('LoginController', function($scope, $window, $location, $mdDialog, $rootScope, $routeParams, Account, LoopBackAuth) {

        $scope.lostPassword = function() {

            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: agneta.partial('password-lost'),
                controller: 'PassLostCtrl'
            });

        };

        $scope.signIn = function() {

            var email = $scope.loginFields.email;
            var password = $scope.loginFields.password;

            $scope.loading = true;

            $rootScope.signIn({
                    email: email,
                    password: password
                },
                function() {
                    
                    $scope.loading = false;

                });
        };

    });

})();