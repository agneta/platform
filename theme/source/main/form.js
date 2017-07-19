/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/form.js
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
