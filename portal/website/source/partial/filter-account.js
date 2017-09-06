(function() {

  var app = angular.module('MainApp');

  app.controller('FilterAccount', function($controller, $scope, $rootScope, data) {

    angular.extend(this, $controller('DialogCtrl', {
      $scope: $scope
    }));

    $scope.apply = function(){
      data.onApply($scope.filters)
        .then(function(){
          $scope.close();
        });
    };

  });

})();
