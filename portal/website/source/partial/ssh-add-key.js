(function() {

  var app = angular.module('MainApp');

  app.controller('AddSSHCtrl', function($scope, $timeout, $controller, $element, $mdDialog, data) {

    angular.extend(this, $controller('DialogCtrl', {
      $scope: $scope
    }));

    $scope.submit = function() {

      data.onSubmit($scope.formSSHFields);
      $scope.close();

    };

  });

})();
