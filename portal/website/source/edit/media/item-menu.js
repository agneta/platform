function _e_mediaItem(app) {

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
