/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/form/password.js
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
/*global zxcvbn*/

var app = angular.module('MainApp');

app.directive('agPassword', function() {
  return {
    restrict: 'A',
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
        //console.log(strength);
        ngModel.strength = {
          score: strength.score,
          percentage: (strength.score+1)/5*100
        };
        ngModel.feedback = strength.feedback;
        ngModel.$setValidity('password', strength.score>2);
      });


    }
  };
});
