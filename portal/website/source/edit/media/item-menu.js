app.directive('itemMenu', function($mdMenu, $rootScope, $templateRequest) {
  return {
    scope: {
      object: '=itemMenu'
    },
    link: function(scope, element, attrs) {
      $templateRequest('media-item-menu.html').then(function(html) {
        var template = angular.element(html);

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
          console.log('contextmenu', scope.object);
          scope.$apply(function() {
            event.preventDefault();
            RightClickMenuCtrl.open(event);
          });
        });
      });
    }
  };
});
