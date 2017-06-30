(function() {

    var app = angular.module('MainApp');

    app.controller("EditDataCtrl", function($scope, $controller, Edit_Data) {

        angular.extend(this, $controller('EditMainCtrl', {
            $scope: $scope
        }));

        $scope.init(Edit_Data);

    });

})();
