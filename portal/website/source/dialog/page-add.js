/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/dialog/page-add.js
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

/*global S*/

(function() {

  agneta.directive('AgPageAdd', function(data, Portal) {

    var scopeEdit = data.scopeEdit;
    var helpers = data.helpers;
    var vm = this;

    agneta.extend(vm, 'AgDialogCtrl');

    if (!scopeEdit.template) {
      return;
    }

    var defaultPath = scopeEdit.page && scopeEdit.page.path;
    if (!defaultPath) {
      defaultPath = scopeEdit.template.path_default || '';
      defaultPath += '/old-file-name';
    }

    defaultPath = defaultPath.split('/');
    defaultPath.pop();
    defaultPath = defaultPath.join('/');
    defaultPath = agneta.urljoin(defaultPath, 'new-file-name');

    if (defaultPath[0] != '/')
      defaultPath = '/' + defaultPath;

    vm.$watch('formSubmitFields.title',function(newValue){
      var name = 'untitled';
      if(newValue && newValue.length){
        name = S(newValue).slugify().s;
      }
      vm.formSubmitFields.path = `/${name}`;
    });

    vm.formSubmitFields = {
      path: defaultPath
    };

    vm.template = scopeEdit.template;

    vm.submit = function() {

      var fields = vm.formSubmitFields;
      vm.loading = true;

      helpers.Model.new({
        title: fields.title,
        path: fields.path,
        template: vm.template.id
      })
        .$promise
        .then(function(result) {
          helpers.toast(result.message || 'File created');

          Portal.socket.once('page-reload', function() {
            return scopeEdit.getPage(result.id)
              .then(function() {
                vm.close();
                return scopeEdit.selectTemplate();
              })
              .finally(function() {
                vm.loading = false;
              });
          });

        });

    };

  });
})();
