var app = angular.module('MainApp');

app.directive('agKeydown', function() {
  return {
    restrict: 'A',
    link: function(scope, elem) {
      elem.on('keydown', function(ev) {
        ev.stopPropagation();
      });
    }
  };
});

app.directive('onEnter', function() {
  return function(scope, element, attrs) {
    element.bind('keydown keypress', function(event) {
      if (event.keyCode === 13) {
        scope.$apply(function() {
          scope.$eval(attrs.onEnter);
        });

        event.preventDefault();
      }
    });
  };
});

app.directive('focusMe', function($timeout) {
  return {
    scope: {
      trigger: '@focusMe'
    },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if (value === 'true') {
          $timeout(function() {
            element[0].focus();
          });
        }
      });
    }
  };
});

app.directive('compareTo', function() {
  return {
    require: 'ngModel',
    scope: {
      otherModelValue: '=compareTo'
    },
    link: function(scope, element, attributes, ngModel) {

      ngModel.$validators.compareTo = function(modelValue) {
        return modelValue == scope.otherModelValue;
      };

      scope.$watch('otherModelValue', function() {
        ngModel.$validate();
      });
    }
  };
});
