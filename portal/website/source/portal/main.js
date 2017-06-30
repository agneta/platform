(function() {

    var app = angular.module('MainApp');
    var logLimit = 3000;

    app.run(function($rootScope, $mdToast, Portal) {

        $rootScope.notify = function(options) {
            $mdToast.show(
                $mdToast.simple()
                .textContent(options.message)
                .position('bottom left')
                .hideDelay(3000)
            );
        };

        Portal.socket.on('activity:new', function(activity) {

            var message = 'Activity: ';
            message += activity.account.name || activity.account.email;
            message += ' ' + activity.action_value;

            $mdToast.show(
                $mdToast.simple()
                .textContent(message)
                .position('bottom right')
                .hideDelay(3000)
            );

        });


    });

    app.controller('LiveToggleCtrl', function($scope, $rootScope) {

        $scope.value = false;

        $rootScope.isProduction = function() {
            return $scope.value;
        };

        if (!$rootScope.account.administrator) {
            $scope.value = true;
            return;
        }

        $scope.onChange = function(value) {
            $scope.value = value;
            $rootScope.$broadcast('productionMode', value);
        };


    });

    app.component('memoryUsage', {
        templateUrl: 'memory-usage.html',
        bindings: {
            update: '&'
        },
        controller: function($scope, Portal) {
            var ctrl = this;

            this.$onInit = function() {

                Portal.socket.on('memory:update', function(update) {
                    ctrl.update = update;
                    $scope.$apply();
                });
            };
        }
    });


})();
