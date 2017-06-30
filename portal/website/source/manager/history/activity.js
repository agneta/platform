(function() {

    var app = angular.module('MainApp');

    app.directive('codeActivity', function($filter, $parse, $timeout) {
        return {
            restrict: 'A',
            scope: true,
            link: function(scope, element, attrs) {
                var myCodeMirror = CodeMirror.fromTextArea(element[0], {
                    readOnly: true,
                    lineWrapping: true,
                    lineNumbers: true,
                    mode: "application/json",
                    theme: "monokai"
                });
                var givenValue;

                scope.$watch('data', function(newValue) {
                    if (newValue) {
                        myCodeMirror.setValue(
                            JSON.stringify(newValue, null, 2)
                        );
                        $timeout(function() {
                          myCodeMirror.refresh();
                        }, 100);
                    }
                });
            }
        };
    });

})();
