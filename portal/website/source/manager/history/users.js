(function() {

    var moment = window.moment;
    var angular = window.angular;
    var app = angular.module('MainApp');
    
        app.directive('visUser', function($timeout, $interpolate, $mdDialog) {

        return {
            link: function($scope, $element, $attrs) {
                $scope.createTimeline({
                    $element: $element,
                    getTitle: getTitle,
                    dialogController: "LogUserCtrl",
                    template: "log-user"
                });
            }
        };
    });

    app.controller("LogUserCtrl", function($scope, $controller, $mdDialog, result) {

        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));


        $scope.fromNow = moment.utc(result.time).local().fromNow();


    });


    function getTitle(data) {

        var title = '';


        return title;

    }

})();