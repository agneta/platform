agneta.directive('AgTabs',function($routeParams,$location,$attrs, $timeout){

  var vm = this;
  var tabs = vm.tabs = vm.tabs || {};
  var queryName = $attrs.name || 'tab';
  var tab = tabs[queryName] = {};

  tab.select = function(name,noHistory) {
    console.log(name);
    tab.activeSection = name;
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

  $timeout(function(){
    if($routeParams[queryName]){
      tab.select($routeParams[queryName],true);
    }
    else if(tab.activeSection){
      console.log('aaaa');
      tab.select(tab.activeSection,true);
    }
  },300);


  vm.$on('$routeUpdate', function() {
    var check = $location.search();
    if(!check[queryName]){
      return;
    }
    if (
      check[queryName] == tab.activeSection
    ) {
      return;
    }
    tab.select(check[queryName],true);
  });

});
