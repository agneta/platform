/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/edit/media/item-menu.js
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
function _e_itemMenu(app) {

  app.directive('mediaItem', function($mdMenu, $rootScope, $templateRequest, $compile, $mdDialog) {

    return {
      scope: {
        mediaModel: '=mediaModel',
        selected: '=selected',
        object: '=object'
      },
      link: function(scope, element) {

        function prompt(options) {

          var action = options.action;
          var confirm = $mdDialog.prompt()
            .title(action + ' object')
            .textContent('Enter the location you whish to ' + action + ' the object')
            .placeholder('Location')
            .ok(action)
            .cancel('Cancel');

          return $mdDialog.show(confirm)
            .then(function(dirTarget) {
              return scope.mediaModel[options.method]({
                source: scope.object.location,
                target: dirTarget + '/' + scope.object.name
              })
                .$promise;
            });
        }

        scope.moveObject = function() {

          prompt({
            action: 'move',
            method: 'moveObject'
          });

        };

        scope.copyObject = function() {
          prompt({
            action: 'copy',
            method: 'copyObject'
          });
        };

        $templateRequest('media-item-menu.html').then(function(html) {
          var template = angular.element(
            $compile(html)(scope)
          );

          var RightClickMenuCtrl = {
            open: function(event) {
              scope.object.selected = true;
              $mdMenu.show({
                scope: $rootScope.$new(),
                mdMenuCtrl: RightClickMenuCtrl,
                element: template,
                target: event.target
              });
            },
            close: function() {
              scope.object.selected = false;
              $mdMenu.hide();
            },
            positionMode: function() {
              return {
                left: 'target',
                top: 'target'
              };
            },
            offsets: function() {
              return {
                left: event.offsetX,
                top: event.offsetY
              };
            }
          };

          element.bind('contextmenu', function(event) {
            scope.$apply(function() {
              event.preventDefault();
              RightClickMenuCtrl.open(event);
            });
          });
        });
      }
    };
  });

}
