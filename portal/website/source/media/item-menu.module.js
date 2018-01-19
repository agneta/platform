/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/media/item-menu.module.js
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

agneta.directive('mediaItem', function($mdMenu,$element, EditFile, $rootScope, $mdDialog) {

  var scope = this;

  function prompt(options) {

    var action = options.action;
    var confirm = $mdDialog.prompt()
      .title(action + ' object')
      .textContent(options.message)
      .placeholder('Location')
      .ok(action)
      .cancel('Cancel');

    return $mdDialog.show(confirm);

  }

  function handlePromise(options){
    options.before
      .then(function(result){
        scope.$parent.loading = true;
        return options.after(result);
      })
      .finally(function() {
        scope.$parent.loading = false;
        scope.object.onChange();
      });
  }

  scope.renameObject = function() {

    handlePromise({
      before: prompt({
        action: 'rename',
        message: 'Enter the name of the object'
      }),
      after: function(name) {
        return scope.mediaModel.updateFile({
          location: scope.object.location,
          name: name
        })
          .$promise;
      }
    });

  };

  scope.moveObject = function() {

    handlePromise({
      before: prompt({
        action: 'move',
        message: 'Enter the location you whish to move the object'
      }),
      after: function(dirTarget) {
        return scope.mediaModel.moveObject({
          source: scope.object.location,
          target: dirTarget + '/' + scope.object.name
        })
          .$promise;
      }
    });

  };

  scope.copyObject = function() {

    handlePromise({
      before: prompt({
        action: 'copy',
        message: 'Enter the location you whish to copy the object'
      }),
      after: function(dirTarget) {
        return scope.mediaModel.copyObject({
          source: scope.object.location,
          target: dirTarget + '/' + scope.object.name
        })
          .$promise;
      }
    });

  };

  scope.deleteObject = function() {

    var confirm = $mdDialog.confirm()
      .title('Are you sure about deleting this object?')
      .ariaLabel('delete object')
      .ok('Yes')
      .cancel('Cancel');

    handlePromise({
      before: $mdDialog.show(confirm),
      after: function() {
        return scope.mediaModel.deleteObject({
          location: scope.object.location
        })
          .$promise;
      }
    });

  };

  agneta.contextMenu({
    scope: scope,
    element: $element,
    template: 'media-item-menu.html',
    onOpen: function(){
      scope.object.selected = true;
    },
    onClose: function(){
      scope.object.selected = false;
    }
  });

});
