/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: theme/source/main/portal.js
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
(function() {

  var app = window.angular.module('MainApp');

  app.service('Portal', function(SocketIO) {

    var socket = SocketIO.connect('portal');
    this.socket = socket;
    socket.media = SocketIO.connect('media');
    socket.editor = SocketIO.connect('editor');

  });

  app.run(function(Portal, $rootScope, $route, $timeout){
    var socket = Portal.socket;
    //console.log('Listen');
    socket.on('page-reload', function(data) {

      if(!data){
        return;
      }

      if ($rootScope.viewData.path == data.path) {

        switch(data.type){
          case 'style':
            $timeout(function() {
              $rootScope.loadData({
                filter: data.filter
              });
            }, 100);
            break;
          default:
            $timeout(function() {
              $route.reload();
            }, 10);
            break;
        }
      }
    });

  });

  app.directive('portalEdit', function(Portal, $rootScope) {
    return {
      restrict: 'A',
      link: function(scope, elem) {

        var contentId = elem.attr('portal-edit');
        var listener = 'content-change:' + $rootScope.viewData.path + ':' + contentId;
        //console.log(listener);

        Portal.socket.editor.on(listener, function(data) {

          //console.log(data);
          var value = data.value;
          if (angular.isObject(value)) {
            value = agneta.lng(value);
          }
          elem.html(value || '');
        });

      }
    };
  });

})();
