(function() {

    app.run(function($rootScope, $mdDialog, $route) {

        ////////////////////////////////////////////////////////////////
        // Dialog History
        ////////////////////////////////////////////////////////////////

        $mdDialog._show = $mdDialog.show;

        $mdDialog.show = function(options) {
            options.clickOutsideToClose = true;
            options.preserveScope = true;
            options.autoWrap = true;
            options.parent = angular.element(document.body);
            return $mdDialog._show(options);

        };

        $mdDialog.open = function(options) {
            if (!options.partial) {
                options = {
                    partial: options
                };
            }

            var locals = {};
            var path = agneta.urljoin(agneta.lang,'partial',options.partial);

            if (options.data) {
                locals.data = options.data;
            }

            $rootScope.loadingMain = true;
            $rootScope.loadData(path)
                .then(function(data) {

                    if (data.extra) {
                        locals.remote = data.extra;
                    }

                    var dialogOptions = {
                        onRemoving: options.onRemoving,
                        clickOutsideToClose: true,
                        templateUrl: agneta.partial(options.partial),
                        locals: locals
                    };

                    if (options.nested) {
                        dialogOptions.multiple = true;
                        dialogOptions.preserveScope = true;
                        dialogOptions.autoWrap = true;
                        dialogOptions.skipHide = true;
                    }


                    dialogOptions.controller = options.controller || data.controller || 'DialogController';
                    $mdDialog.show(dialogOptions);
                })
                .finally(function(err) {
                    $rootScope.loadingMain = false;
                });

        };

        $rootScope.dialog = $mdDialog.open;


    });


    app.controller('DialogController', function($scope, $mdDialog, data) {

        $scope.data = data;

    });

    app.controller('DialogCtrl', function($rootScope, $scope, $mdDialog) {
        $scope.close = function() {
            $mdDialog.hide();
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.next = function(data) {
            $mdDialog.hide(data);
        };

        $rootScope.$on('error', function() {
            $scope.loading = false;
        });
    });

    app.controller('DialogConfirm', function($rootScope, $scope, data, $mdDialog) {

        $scope.confirm = function() {
            if (data.onConfirm) {
                data.onConfirm();
            }
            $mdDialog.hide();
        };
        $scope.reject = function() {
            if (data.onReject) {
                data.onReject();
            }
            $mdDialog.hide();
        };

    });

})();
