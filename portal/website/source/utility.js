(function() {

    var app = angular.module('MainApp');
    var logLimit = 3000;

    app.controller("UtilityCtrl", function($scope, $rootScope, $mdToast, Utility, SocketIO, $mdDialog) {

        $scope.logLines = [];
        $scope.progressBars = {};
        $scope.runOptions = {};

        var socket = SocketIO.connect('utilities');
        var utilityName = $rootScope.viewData.extra.name;

        function socketOn(name, cb) {
            socket.on(utilityName + ':' + name, cb);
        }

        Utility.state({
                name: utilityName
            })
            .$promise
            .then(function(options) {
                $scope.parameters = options.parameters;
            });

        socketOn('notify', $rootScope.notify);
        socketOn('init', function(options) {
            $scope.parameters = options.parameters;
            $scope.$apply();
        });

        socketOn('status', function(data) {
            $scope.status = data;
            $scope.$apply();
        });

        socketOn('addLine', function(options) {
            options[options.type] = true;
            $scope.addLine(options);
            $scope.$apply();
        });

        socketOn('progress:new', function(data) {
            console.log(data);
            $scope.progressBars[data.id] = {
                value: 0,
                count: 0,
                length: data.length,
                title: data.options.title
            };
            $scope.$apply();
        });

        socketOn('progress:update', function(data) {
            var progressBar = $scope.progressBars[data.id];
            progressBar.length = data.length;
            onProgressUpdate(progressBar);
            $scope.$apply();
        });

        socketOn('progress:tick', function(data) {

            var progressBar = $scope.progressBars[data.id];
            if (!progressBar) {
                return;
            }
            if (progressBar.complete) {
                console.error('Ticking on a complete progress bar');
                return;
            }

            progressBar.current = data.options;
            progressBar.count++;
            onProgressUpdate(progressBar);
            $scope.$apply();

        });

        function onProgressUpdate(progressBar) {
            progressBar.value = progressBar.count / progressBar.length * 100;

            if (progressBar.count == progressBar.length) {
                progressBar.complete = true;
                progressBar.current = {
                    title: 'Complete'
                };
            } else {
                progressBar.complete = false;
            }
        }

        $scope.run = function() {
            $scope.clear();
            $scope.log('Starting...');
            Utility.start({
                name: utilityName,
                options: $scope.runOptions
            });
        };

        $scope.clear = function() {
            $scope.logLines = [];
            $scope.progressBars = {};
        };

        $scope.log = function(message) {
            $scope.addLine({
                log: true,
                message: message
            });
        };

        $scope.addLine = function(line) {
            $scope.logLines.unshift(line);
            while ($scope.logLines.length > logLimit) {
                $scope.logLines.pop();
            }
        };

        $scope.socket = socket;

        $scope.log('Click "start" to run the utility...');

    });

})();
