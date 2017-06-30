$scope.openSource = function() {

    $mdDialog.open({
        partial: 'page-source',
        data: {
            onDone: function(newVal) {

                  if (!$scope.page) {
                      return;
                  }
                  var data;
                  try {
                      data = jsyaml.safeLoad(newVal);
                  } catch (e) {
                      return;
                  }
                  $scope.page.data = null;

                  $timeout(function() {
                      $scope.page.data = data;
                  }, 100);

            },
            getData: function() {
                $scope.clearHiddenData();
                var data = angular.copy($scope.page.data);
                delete data.undefined;
                return jsyaml.dump(data);
            }
        }
    });
};
