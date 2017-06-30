(function() {

    var app = window.angular.module('MainApp');

    app.controller('ModalFrame', function($scope, $controller, data) {

        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));

        $scope.data = data;

    });

})();
