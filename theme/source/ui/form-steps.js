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
