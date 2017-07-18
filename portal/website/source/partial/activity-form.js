(function() {

    var app = angular.module('MainApp');

    app.controller('ActivityFormCtrl', function($controller, $scope, $rootScope, data, Form, Production_Form) {

        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));

        $scope.loading = true;
        var Model = $rootScope.isProduction() ? Production_Form : Form;

        data.Model_Item.details({
                id: data.activity.id
            })
            .$promise
            .then(function(result) {
                if (!result.data.formId) {
                    return result;
                }
                return Model.load({
                        id: result.data.formId
                    })
                    .$promise;

            })
            .then(function(result) {
                result.time = result.time || result.createdAt;
                $scope.activity = result;
            })
            .finally(function() {
                $scope.loading = false;
            });

    });

})();
