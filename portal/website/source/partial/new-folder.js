(function() {

  var app = angular.module('MainApp');

  app.controller('NewFolder', function($controller, $scope, $rootScope, data) {

    angular.extend(this, $controller('DialogCtrl', {
      $scope: $scope
    }));

    $scope.apply = function(){
      data.onApply($scope.name)
        .then(function(){
          $scope.close();
        });
    };

  });

})();
