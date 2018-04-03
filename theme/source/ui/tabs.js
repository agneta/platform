agneta.directive('AgTabs',function($routeParams,$location, $timeout){
  var vm = this;

  vm.select = function(name,noHistory) {
    vm.activeSection = name;
    var query = $location.search();
    query.tab = name;
    var location = $location.search(query);
    if(noHistory){
      location.replace();
    }
    $timeout(function(){
      vm.$emit('tab-change',name);
    },100);
  };

  if($routeParams.tab){
    vm.select($routeParams.tab,true);
  }
  else if(vm.activeSection){
    vm.select(vm.activeSection,true);
  }

  vm.$on('$routeUpdate', function() {
    var check = $location.search();
    if(!check.tab){
      return;
    }
    if (
      check.tab == vm.activeSection
    ) {
      return;
    }
    vm.select(check.tab,true);
  });

});
