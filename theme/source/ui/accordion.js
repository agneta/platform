(function(){
  var activeScope;
  var scopeCount = 0;
  app.controller('MenuItemCtrl', function($rootScope, $scope, $element, $timeout, $mdSidenav, $log) {

      $scope.expanded = false;
      $scope.id = scopeCount++;
      var element = $element[0];
      var list = element.querySelector('.list');
      $scope.$watch('expanded', function() {

          if ($scope.expanded) {
            list.style.transition = 'none';
            list.style['margin-top'] = -list.offsetHeight;
              $timeout(function() {
                list.style.transition = null;
                list.style['margin-top'] = null;
              }, 100);
              $scope.expandedClass = true;
          } else {
            if(list.offsetHeight>0){
            list.style['margin-top'] = -list.offsetHeight;
          }
            $timeout(function() {
              $scope.expandedClass = false;
            }, 600);
          }
      });

      $scope.toggleView = function(data) {

          $scope.expanded = !$scope.expanded;

          //

          var skip = (function() {

              var parent = $scope.$parent;

              while (parent) {
                  if (parent.expanded) {
                      if (activeScope && activeScope.id == parent.id) {
                          return true;
                      }
                  }
                  parent = parent.$parent;
              }

              return false;

          })();

          if (!skip) {
              close();
          }

          function close() {
              if (activeScope) {
                  var parent = activeScope.$parent;
                  while (parent) {
                      if (!$scope.$parent.id) {
                          parent.expanded = false;
                      }
                      parent = parent.$parent;
                  }
                  activeScope.expanded = false;
              }
          }

          //
          activeScope = $scope.expanded ? $scope : null;

      };
  });
})();
