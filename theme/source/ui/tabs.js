agneta.directive('AgTabs',function($routeParams,$location, $timeout){
  var vm = this;

  vm.select = function(name) {
    vm.activeSection = name;
    var query = $location.search();
    query.tab = name;
    $location.search(query);
    $timeout(function(){
      vm.$emit('tab-change',name);
    },100);
  };

  if($routeParams.tab){
    vm.select($routeParams.tab);
  }
  else if(vm.activeSection){
    vm.select(vm.activeSection);
  }

});
