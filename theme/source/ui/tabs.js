agneta.directive('AgTabs',function($routeParams,$location){
  var vm = this;
  if($routeParams.tab){
    vm.activeSection = $routeParams.tab;
  }
  vm.select = function(name) {
    vm.activeSection = name;
    var query = $location.search();
    query.tab = name;
    $location.search(query);
  };
});
