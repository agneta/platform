(function() {

    app.directive('selectButtons', function($filter,$parse,$timeout) {
        return {
            restrict: 'E',
            scope: true,
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                if (!ngModel) return;

                var model = $parse(attrs.ngModel);

                scope.$watch('selected', function(name) {
                    if (attrs.required) {
                        ngModel.$setValidity('required', name ? true : false);
                    }

                }, true);

                scope.select = function(name) {
                    model.assign(scope.$parent, name);
                    ngModel.$setViewValue(name);
                };
            }
        };
    });

    app.directive('checkboxes', function($filter) {
        return {
            restrict: 'E',
            scope: true,
            require: '?ngModel',
            link: function(scope, element, attrs, ngModel) {
                if (!ngModel) return;

                var minselect = attrs.minselect || 0;

                scope.$watch(function() {
                    return ngModel.$modelValue;
                }, function(newValue) {
                    var length = 0;
                    for (var key in newValue) {
                        if (newValue[key]) {
                            length++;
                        }
                    }

                    ngModel.$setValidity('minselect', length >= minselect);


                }, true);


            }
        };
    });

})();
