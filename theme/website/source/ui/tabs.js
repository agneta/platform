var app = window.angular.module('MainApp');

app.directive('agTabs', function($routeParams,$location, $timeout) {
  return {
    restrict: 'A',
    scope: true,
    link: function(vm, element, attrs) {
      var queryName = attrs.name || 'tab';

      vm.select = function(name,noHistory) {
        //console.log(name);
        vm.activeSection = name;
        var query = $location.search();
        query[queryName] = name;
        var location = $location.search(query);
        if(noHistory){
          location.replace();
        }
        $timeout(function(){
          vm.$emit('tab-change',name);
        },100);
      };

      if($routeParams[queryName]){
        vm.select($routeParams[queryName],true);
      }
      else if(attrs.default){
        vm.select(attrs.default,true);
      }


      vm.$on('$routeUpdate', function() {
        var check = $location.search();
        if(!check[queryName]){
          return;
        }
        if (
          check[queryName] == vm.activeSection
        ) {
          return;
        }
        vm.select(check[queryName],true);
      });
    }
  };
});
