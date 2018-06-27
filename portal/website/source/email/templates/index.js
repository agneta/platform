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
  agneta.directive('AgPreviewEmailCtrl', function(
    $sce,
    SocketIO,
    $rootScope,
    Contact_Email
  ) {
    var vm = this;
    var email = {};
    vm.email = email;
    var socket = SocketIO.connect('email');
    socket.on('edit', function(data) {
      if (data.global || email.template.name == data.name) {
        email.loadTemplate(data.name);
      }
    });

    Contact_Email.templateList().$promise.then(function(result) {
      email.templates = result.list;
      email.loadTemplate(result.list[0]);
    });

    email.lang = agneta.lang;

    email.loadTemplate = function(item) {
      item = item || email.template.name;
      $rootScope.loadingMain = true;

      Contact_Email.templateRender({
        name: item,
        lng: email.lang
      }).$promise.then(function(result) {
        $rootScope.loadingMain = false;
        result.html = $sce.trustAsHtml(result.html);
        email.template = result;
      });
    };
  });
})();
