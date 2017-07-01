(function() {

    var app = angular.module('MainApp');

    app.controller("PreviewEmailCtrl", function($scope, $sce, $rootScope, Email_Template) {

        Email_Template.getAll()
            .$promise
            .then(function(result) {
                $scope.templates = result.list;
                $scope.loadTemplate(result.list[0]);
            });

        $scope.loadTemplate = function(item) {

            $rootScope.loadingMain = true;

            Email_Template.render({
                    name: item,
                    lng: 'en'
                })
                .$promise
                .then(function(result) {
                    $rootScope.loadingMain = false;
                    result.html = $sce.trustAsHtml(result.html);
                    $scope.template = result;
                });

        };

    });

})();
