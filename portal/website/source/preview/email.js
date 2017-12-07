/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/preview/email.js
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

  agneta.directive('AgPreviewEmailCtrl', function($sce, $rootScope, Email_Template) {

    var vm = this;

    Email_Template.getAll()
      .$promise
      .then(function(result) {
        vm.templates = result.list;
        vm.loadTemplate(result.list[0]);
      });

    vm.loadTemplate = function(item) {

      $rootScope.loadingMain = true;

      Email_Template.render({
        name: item,
        lng: 'en'
      })
        .$promise
        .then(function(result) {
          $rootScope.loadingMain = false;
          result.html = $sce.trustAsHtml(result.html);
          vm.template = result;
        });

    };

  });

})();
