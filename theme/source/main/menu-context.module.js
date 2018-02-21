/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/menu-context.module.js
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
var app = angular.module('MainApp');

app.run(function($rootScope, $templateRequest, $compile, $mdMenu) {

  agneta.contextMenu = function(options) {

    var element = options.element;
    var scope = options.scope;

    $templateRequest(options.template).then(function(html) {
      var template = angular.element(
        $compile(html)(scope)
      );

      var RightClickMenuCtrl = {
        open: function(event) {
          options.onOpen && options.onOpen(event);
          $mdMenu.show({
            scope: $rootScope.$new(),
            mdMenuCtrl: RightClickMenuCtrl,
            element: template,
            target: event.target
          });
        },
        close: function() {
          options.onClose && options.onClose();
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
        event.stopPropagation();
        scope.$apply(function() {
          event.preventDefault();
          RightClickMenuCtrl.open(event);
        });
      });
    });
  };


});
