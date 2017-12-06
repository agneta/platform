/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/_pages/main.js
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

function _e_main(vm, $rootScope, helpers, $location, $timeout, $mdDialog, scopeEdit, Portal, GIT) {

  vm.getPage = function(obj) {
    var id = obj.id || obj;
    $rootScope.loadingMain = true;
    return helpers.Model.loadOne({
      id: id
    })
      .$promise
      .then(function(result) {

        var data = result.page.data;

        if (vm.template) {
          for (var i in vm.template.fields) {
            var field = vm.template.fields[i];
            data[field.name] = data[field.name] || helpers.fieldValue(field);
          }
        }

        vm.template = result.template;
        vm.pagePath = result.page.path;
        helpers.structureData(vm.template, data);

        $location.search({
          id: id,
        });

        if (!vm.pages) {
          vm.selectTemplate(vm.template);
        }

        vm.work = null;
        vm.page = null;

        $timeout(function() {
          vm.page = result.page;
        }, 300);

      })
      .finally(function() {
        $rootScope.loadingMain = false;
      });
  };


  vm.pageActive = function(id) {

    if (vm.page) {
      return (id == vm.page.id) ? 'active' : null;
    }

  };

  vm.pageDelete = function() {

    var confirm = $mdDialog.confirm()
      .title('Deleting Page')
      .textContent('Are you sure you want to delete this page?')
      .ok('Yes')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      helpers.Model.delete({
        id: vm.page.id,
      })
        .$promise
        .then(function() {
          helpers.toast('File deleted');
          Portal.socket.once('page-reload', function() {
            $timeout(function() {
              vm.page = null;
              vm.selectTemplate();
            }, 10);
          });
        });
    });

  };

  vm.pageAdd = function() {
    $mdDialog.open({
      partial: 'page-add',
      controller: function($controller) {

        angular.extend(this, $controller('AgDialogCtrl', {
          $scope: vm
        }));

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
      }
    });
  };

  vm.push = function() {

    $mdDialog.open({
      partial: 'push-changes',
      controller: function($controller) {

        angular.extend(this, $controller('AgDialogCtrl', {
          $scope: vm
        }));

        vm.loading = true;
        GIT.status()
          .$promise
          .then(function(result) {
            //console.log(result);
            vm.files = result.files;
          })
          .finally(function() {
            vm.loading = false;
          });

        vm.submit = function() {
          vm.loading = true;
          GIT.push({
            message: vm.formSubmitFields.message
          })
            .$promise
            .then(function() {
              vm.close();
              helpers.toast('Changes are pushed to repository');
            })
            .finally(function() {
              vm.loading = false;
            });
        };

      }
    });

  };

  (function() {

    var pending = false;

    vm.save = function(autosave) {

      if (!vm.page) {
        return;
      }

      if (pending) {
        return;
      }

      pending = true;

      setTimeout(function() {

        pending = false;

        vm.clearHiddenData();

        helpers.Model.save({
          id: vm.page.id,
          data: vm.page.data
        })
          .$promise
          .then(function(result) {
            if (!autosave) {
              helpers.toast(result.message || 'Changes saved');
            }
          });

      }, 1400);

    };

  })();
}
