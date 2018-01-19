/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/_pages/contributor.module.js
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
module.exports = function(vm, $rootScope, Account, Portal, $timeout, Role_Editor) {

  vm.contributors = {};

  function loadContributor(id) {

    if (vm.contributors[id].info) {
      return;
    }

    Account.get({
      id: id
    })
      .$promise
      .then(function(result) {
        //console.log(result);
        vm.contributors[id].info = result;
      });

  }

  vm.contributorInitials = function(id) {
    var result = vm.contributors[id];
    if (!result) {
      return;
    }
    result = result.info;
    if (!result) {
      return;
    }
    result = result.name || result.username || result.email;
    return result[0];
  };

  var lastEdit = {};

  vm.onFieldChange = function(child) {

    $timeout(function() {
      var value = child.__value;
      if (angular.isObject(value)) {
        value = value[vm.edit.lang];
      }
      //console.log('emit');
      if (lastEdit.id == child.__id && lastEdit.value == value) {
        return;
      }

      Role_Editor.contentChange({
        data: {
          id: child.__id,
          path: vm.pagePath,
          lang: vm.edit.lang,
          value: value
        }
      });
    }, 10);


  };

  vm.registerInput = function(child) {

    var listener = 'content-change:' + vm.pagePath + ':' + child.__id;
    Portal.socket.editor.on(listener, function(data) {

      if (child.__value[data.lang] == data.value) {
        return;
      }

      if (!vm.edit.realtime) {
        return;
      }

      lastEdit.id = child.__id;
      lastEdit.value = data.value;

      if (data.actor != $rootScope.account.id) {
        child.__value[data.lang] = data.value;
      }

      child.$$contributors = child.$$contributors || {};

      var contribution = vm.contributors[data.actor];
      if (contribution) {
        delete contribution.data.$$contributors[data.actor];
      }

      var contributor = child.$$contributors[data.actor] =
        vm.contributors[data.actor] =
        vm.contributors[data.actor] || {};

      contributor.data = child;

      loadContributor(data.actor);

      $timeout(function() {

      }, 10);
    });

  };

};
