/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/manager/history/activity.js
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
          mode: 'application/json',
          theme: 'monokai'
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
