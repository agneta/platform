(function() {

  var app = angular.module('MainApp');

  app.controller('AddSSHCtrl', function($scope, $timeout, $controller, $element, $mdDialog, data) {

    angular.extend(this, $controller('DialogCtrl', {
      $scope: $scope
    }));

    $scope.submit = function() {

      var model = data.model;
      var key = $scope.formSubmitFields;

      model.sshAdd({
        title: key.title,
        data: key.data
      })
        .$promise
        .then(data.onSuccess)
        .finally(data.onFinally);

    };

  });

})();
