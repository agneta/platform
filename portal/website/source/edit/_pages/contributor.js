(function() {

    $scope.contributors = {};

    function loadContributor(id) {

        if ($scope.contributors[id].info) {
            return;
        }

        Account.get({
                id: id
            })
            .$promise
            .then(function(result) {
                //console.log(result);
                $scope.contributors[id].info = result;
            });

    }

    $scope.contributorInitials = function(id) {
        var result = $scope.contributors[id];
        if (!result) {
            return;
        }
        result = result.info;
        if (!result) {
            return;
        }
        result = result.name || result.username || result.email;
        return result[0];
    };

    var lastEdit = {};

    $scope.onFieldChange = function(child) {

        var value = child.__value;

        if (angular.isObject(value)) {
          value = value[$scope.edit.lang];
        }
        console.log('emit');
        if (lastEdit.id == child.__id && lastEdit.value == value) {
            return;
        }

        Portal.socket.emit('content-change', {
            id: child.__id,
            path: $scope.pagePath,
            lang: $scope.edit.lang,
            value: value
        });

    };

    $scope.registerInput = function(child) {

        var listener = 'content-change:' + $scope.pagePath + ':' + child.__id;
        Portal.socket.on(listener, function(data) {


            if (child.__value[data.lang] == data.value) {
                return;
            }

            lastEdit.id = child.__id;
            lastEdit.value = data.value;

            if (data.actor != $rootScope.account.id) {
                child.__value[data.lang] = data.value;
            }

            child.$$contributors = child.$$contributors || {};

            var contribution = $scope.contributors[data.actor];
            if (contribution) {
                delete contribution.data.$$contributors[data.actor];
            }

            var contributor = child.$$contributors[data.actor] =
                $scope.contributors[data.actor] =
                $scope.contributors[data.actor] || {};

            contributor.data = child;

            loadContributor(data.actor);

            $timeout(function () {

            }, 10);
        });

    };

})();
