/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/content/history.module.js
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

module.exports = function(vm, helpers) {
  vm.showCommit = function(commit) {
    helpers.Model.loadCommit({
      id: vm.page.id,
      commit: commit.hash || commit.id
    })
      .$promise
      .then(function(result) {
        vm.work = vm.page.data;
        helpers.structureData(vm.template, result.data);
        helpers.setData(result.data);
      });
  };

  vm.rollback = function() {
    vm.save();
    vm.work = null;
  };

  vm.cancelRollback = function() {
    helpers.setData(vm.work);
    vm.work = null;
  };
};
