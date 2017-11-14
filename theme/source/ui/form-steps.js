/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/ui/form-steps.js
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

  var app = window.angular.module('MainApp');

  app.service('FormSteps', function() {

    this.init = function(options) {

      var $scope = options.scope;
      var steps = options.steps;

      $scope.currentStep = steps[0];
      //$scope.loading = true;

      var stepsDict = {};

      for (var index in steps) {
        index = parseFloat(index);
        stepsDict[steps[index]] = {
          next: steps[index + 1],
          previous: steps[index - 1]
        };
      }

      //-------------------------------------------------

      $scope.back = function() {
        var step = stepsDict[$scope.currentStep];
        if (step.previous) {
          $scope.currentStep = step.previous;
        }
      };

      //-------------------------------------------------

      var errors = {};

      $scope.next = function(data) {
        data = data || {};
        var nextStep = stepsDict[$scope.currentStep].next;
        errors[$scope.currentStep] = data.invalid;
        if (!data.invalid) {
          $scope.currentStep = nextStep;
        }
      };

      $scope.getError = function(step) {
        return errors[step];
      };

      $scope.hasError = function(step, name) {
        var error = errors[step];
        return error && (name ? (error.name == name) : true);
      };

      $scope.clearErrors = function() {
        errors = {};
      };

    };


  });

})();
