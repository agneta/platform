(function() {

    var app = angular.module('MainApp');

    app.controller('PageSourceCtrl', function($scope,$timeout, $controller, $element,$mdDialog, data) {
        var myCodeMirror;

        angular.extend(this, $controller('DialogCtrl', {
            $scope: $scope
        }));

        setTimeout(function() {
            var editorElm = document.querySelector('#source-editor');
            //console.log(editorElm);

            myCodeMirror = CodeMirror.fromTextArea(editorElm, {
                lineNumbers: true,
                mode: "text/x-yaml",
                theme: "monokai",
                gutters: ["CodeMirror-lint-markers"],
                lint: true
            });

            loadData();

        }, 100);

        function loadData() {
            myCodeMirror.setValue(data.getData());
            $timeout(function() {
                myCodeMirror.refresh();
            }, 100);
        }

        $scope.done = function() {
            data.onDone(
                myCodeMirror.getValue()
            );
            $mdDialog.hide();
        };

    });

})();
