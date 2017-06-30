(function() {

    var app = angular.module('MainApp');

    app.controller("EditPagesCtrl", function($scope, $controller, Edit_Page) {

        angular.extend(this, $controller('EditMainCtrl', {
            $scope: $scope
        }));

        $scope.init(Edit_Page);

    });

})();
