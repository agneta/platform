agneta.directive('AgTabs',function($routeParams,$location,$attrs, $timeout){

  var vm = this;
  var queryName = $attrs.name || 'tab';

  vm.select = function(name,noHistory) {
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
  else if(vm.activeSection){
    vm.select(vm.activeSection,true);
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

});
