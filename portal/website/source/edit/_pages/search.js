$scope.onSearch = function(value) {

    var scopeName;

    if ($scope.pages) {
        scopeName = 'pages';
    }
    if ($scope.templates) {
        scopeName = 'templates';
    }

    if (!value) {


        $scope[scopeName] = null;
        $timeout(function() {
            $scope[scopeName] = itemsLoaded;
        }, 100);

        return;
    }
    
    var result = fuse.search(value).slice(0, 6);
    $scope[scopeName] = result;
};
