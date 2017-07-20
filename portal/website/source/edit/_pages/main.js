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
$scope.getPage = function(obj) {
  var id = obj.id || obj;
  $rootScope.loadingMain = true;
  return Model.loadOne({
    id: id
  })
    .$promise
    .then(function(result) {

      var data = result.page.data;

      if ($scope.template) {
        for (var i in $scope.template.fields) {
          var field = $scope.template.fields[i];
          data[field.name] = data[field.name] || fieldValue(field);
        }
      }

      $scope.template = result.template;
      $scope.pagePath = result.page.path;
      structureData($scope.template, data);

      $location.search({
        id: id,
      });

      if (!$scope.pages) {
        $scope.selectTemplate($scope.template);
      }

      $scope.work = null;
      $scope.page = null;

      $timeout(function() {
        $scope.page = result.page;
      }, 300);

    })
    .finally(function() {
      $rootScope.loadingMain = false;
    });
};


$scope.pageActive = function(id) {

  if ($scope.page) {
    return (id == $scope.page.id) ? 'active' : null;
  }

};

$scope.pageDelete = function() {

  var confirm = $mdDialog.confirm()
    .title('Deleting Page')
    .textContent('Are you sure you want to delete this page?')
    .ok('Yes')
    .cancel('Cancel');

  $mdDialog.show(confirm).then(function() {
    Model.delete({
      id: $scope.page.id,
    })
      .$promise
      .then(function() {
        toast('File deleted');
        Portal.socket.once('page-reload', function() {
          $timeout(function() {
            $scope.page = null;
            $scope.selectTemplate();
          }, 10);
        });
      });
  });

};

$scope.pageAdd = function() {
  $mdDialog.open({
    partial: 'page-add',
    controller: function($scope, $controller) {

      angular.extend(this, $controller('DialogCtrl', {
        $scope: $scope
      }));

      var defaultPath = scopeEdit.page.path || '/default';
      defaultPath = defaultPath.split('/');
      defaultPath.pop();
      defaultPath = defaultPath.join('/');
      defaultPath = agneta.urljoin(defaultPath, 'new-file-name');

      if (defaultPath[0] != '/')
        defaultPath = '/' + defaultPath;

      $scope.formSubmitFields = {
        path: defaultPath
      };

      $scope.template = scopeEdit.template;

      $scope.submit = function() {

        var fields = $scope.formSubmitFields;
        $scope.loading = true;

        Model.new({
          title: fields.title,
          path: fields.path,
          template: $scope.template.id
        })
          .$promise
          .then(function(result) {
            toast(result.message || 'File created');

            Portal.socket.once('page-reload', function() {
              return scopeEdit.getPage(result.id)
                .then(function() {
                  $scope.close();
                  return scopeEdit.selectTemplate();
                })
                .finally(function() {
                  $scope.loading = false;
                });
            });

          });

      };
    }
  });
};

$scope.push = function() {

  $mdDialog.open({
    partial: 'push-changes',
    controller: function($scope, $controller) {

      angular.extend(this, $controller('DialogCtrl', {
        $scope: $scope
      }));

      $scope.loading = true;
      GIT.status()
        .$promise
        .then(function(result) {
          //console.log(result);
          $scope.files = result.files;
        })
        .finally(function() {
          $scope.loading = false;
        });

      $scope.submit = function() {
        $scope.loading = true;
        GIT.push({
          message: $scope.formSubmitFields.message
        })
          .$promise
          .then(function() {
            $scope.close();
            toast('Changes are pushed to repository');
          })
          .finally(function() {
            $scope.loading = false;
          });
      };

    }
  });

};

(function() {

  var pending = false;

  $scope.save = function(autosave) {

    if (!$scope.page) {
      return;
    }

    if (pending) {
      return;
    }

    pending = true;

    setTimeout(function() {

      pending = false;

      $scope.clearHiddenData();

      Model.save({
        id: $scope.page.id,
        data: $scope.page.data
      })
        .$promise
        .then(function(result) {
          if (!autosave) {
            toast(result.message || 'Changes saved');
          }
        });

    }, 1400);

  };

})();
