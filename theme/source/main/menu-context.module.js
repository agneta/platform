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
        scope.$apply(function() {
          event.preventDefault();
          RightClickMenuCtrl.open(event);
        });
      });
    });
  };


});
