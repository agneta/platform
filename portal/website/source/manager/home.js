(function() {

    var app = angular.module('MainApp');

    app.controller("HomeCtrl", function($scope, $rootScope, $location, Account, $route, $timeout, $ocLazyLoad, $mdDialog) {

        $ocLazyLoad.load({
            name: 'angularMoment',
            files: [agneta.get_lib('angular-moment.min.js')]
        });

        $scope.accounts = {};
        $scope.activities = {};

        $rootScope.$on('accountCheck', function(event, account) {
            if (account) {
                init();
            }
        });

        if ($rootScope.account) {
            init();
        }

        function init() {

            Account.total({}).$promise
                .then(function(res) {
                    $scope.accounts.count = res.count;
                });

            Account.recent({
                    limit: 10
                }).$promise
                .then(function(recent) {
                    $scope.accounts.recent = recent;
                });

        }

        $scope.openAccount = function(account) {
            $location.path(agneta.langPath('manager/accounts')).search({
                account: account.id
            });
        };

    });

    app.controller("HomeActivitiesCtrl", function($scope, $rootScope, $q, $timeout) {
        ///////////////////////////////////////////

        $scope.feeds = {};
        $scope.periodSelected = 'dayOfYear';

        $scope.onPeriodChange = function() {

            $scope.promises = [];
            $scope.$broadcast('periodChanged');
            $scope.progressMode = 'indeterminate';

            $q.all($scope.promises)
                .then(function() {
                    $scope.progressMode = 'determinate';
                    //console.log('dooone');
                });
        };

        $timeout($scope.onPeriodChange, 100);

    });

    app.directive('agnetaHomeFeed', function(Activity_Count, $timeout, $interpolate, $mdDialog) {

        return {
            link: function($scope, $element, $attrs) {

                $scope.$on('periodChanged', init);

                function init() {

                    var promise = Activity_Count.totals({
                            feed: $attrs.name,
                            period: $scope.periodSelected
                        }).$promise
                        .then(function(res) {

                            $scope.feeds[$attrs.name] = res.count;

                        });

                    $scope.promises.push(promise);

                }
            }
        };
    });


})();
