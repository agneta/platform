$scope.showCommit = function(commit) {
    Model.loadCommit({
            id: $scope.page.id,
            commit: commit.hash
        })
        .$promise
        .then(function(result) {
            $scope.work = $scope.page.data;
            structureData($scope.template, result.data);
            setData(result.data);
        });
};

$scope.rollback = function(id) {
    $scope.save();
    $scope.work = null;
};

$scope.cancelRollback = function(id) {
    setData($scope.work);
    $scope.work = null;
};
