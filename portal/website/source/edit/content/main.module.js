/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/content/main.module.js
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

module.exports = function(options) {

  var vm =  options.vm;
  var $rootScope =  options.$rootScope;
  var helpers =  options.helpers;
  var $location =  options.$location;
  var $routeParams =  options.$routeParams;
  var $timeout =  options.$timeout;
  var $mdDialog =  options.$mdDialog;
  var scopeEdit =  options.scopeEdit;
  var Portal =  options.Portal;

  vm.getPage = function(obj) {
    obj = obj || vm.page.id;
    var id = obj.id || obj;
    $rootScope.loadingMain = true;
    return helpers.Model.loadOne({
      id: id,
      template: obj.template || vm.template.id || $routeParams.template
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

        vm.relations = result.relations;
        vm.template = result.template;
        vm.pagePath = result.page.path;
        helpers.structureData(vm.template, data);

        $location.search({
          id: id,
          template: vm.template.id
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
        template: vm.template.id
      })
        .$promise
        .then(function() {
          onReload();
          helpers.toast('File deleted');
          Portal.socket.once('page-reload',onReload);
        });
    });

    function onReload() {
      $timeout(function() {
        vm.page = null;
        vm.selectTemplate();
      }, 10);
    }

  };

  vm.pageAdd = function() {
    $mdDialog.open({
      partial: 'page-add',
      data: {
        scopeEdit: scopeEdit,
        helpers: helpers
      }
    });
  };

  vm.push = function() {
    $mdDialog.open({
      partial: 'push-changes',
      data: {
        helpers: helpers
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

      $rootScope.loadingMain = true;
      pending = true;

      setTimeout(function() {

        pending = false;

        vm.clearHiddenData();

        helpers.Model.save({
          id: vm.page.id,
          template: vm.template.id,
          data: vm.page.data
        })
          .$promise
          .then(function(result) {
            if (!autosave) {
              helpers.toast(result.message || 'Changes saved');
            }
          })
          .finally(function() {
            $rootScope.loadingMain = false;
          });

      }, 1400);

    };

  })();
};
