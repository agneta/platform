/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/_pages/history.js
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
$scope.showCommit = function(commit) {
  Model.loadCommit({
    id: $scope.page.id,
    commit: commit.hash
  })
    .$promise
    .then(function(result) {
      $scope.work = $scope.page.data;
      structureData($scope.template, result.data);
      setData(result.data);
    });
};

$scope.rollback = function(id) {
  $scope.save();
  $scope.work = null;
};

$scope.cancelRollback = function(id) {
  setData($scope.work);
  $scope.work = null;
};
