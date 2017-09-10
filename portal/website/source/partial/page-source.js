/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/partial/page-source.js
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

/*global CodeMirror*/

(function() {

  var app = angular.module('MainApp');

  app.controller('PageSourceCtrl', function($scope,$timeout, $controller, $element,$mdDialog, data) {
    var myCodeMirror;

    angular.extend(this, $controller('DialogCtrl', {
      $scope: $scope
    }));

    setTimeout(function() {
      var editorElm = document.querySelector('#source-editor');
      //console.log(editorElm);

      myCodeMirror = CodeMirror.fromTextArea(editorElm, {
        lineNumbers: true,
        mode: 'text/x-yaml',
        theme: 'monokai',
        gutters: ['CodeMirror-lint-markers'],
        lint: true
      });

      loadData();

    }, 100);

    function loadData() {
      myCodeMirror.setValue(data.getData());
      $timeout(function() {
        myCodeMirror.refresh();
      }, 100);
    }

    $scope.done = function() {
      data.onDone(
        myCodeMirror.getValue()
      );
      $mdDialog.hide();
    };

  });

})();
