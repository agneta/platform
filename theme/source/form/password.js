/*global zxcvbn*/

var app = angular.module('MainApp');

app.directive('agPassword', function() {
  return {
    restrict: 'A',
    scope: true,
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      if (!ngModel) return;

      //var model = $parse(attrs.ngModel);

      scope.$watch(attrs.ngModel, function(value) {
        if(!value){
          ngModel.strength = null;
          return;
        }

        var strength = zxcvbn(value);
        console.log(strength);
        ngModel.strength = {
          score: strength.score,
          percentage: (strength.score+1)/5*100
        };
        ngModel.feedback = strength.feedback;
        ngModel.$setValidity('password', strength.score>2);

      });

      //model.assign(scope.$parent, name);
      //ngModel.$setViewValue(name);
    }
  };
});
