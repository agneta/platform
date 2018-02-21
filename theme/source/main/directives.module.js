/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/directives.module.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
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
