module.exports = function(shared) {

  var vm = shared.vm;
  var $location = shared.$location;

  var current = $location.search();
  vm.$on('$routeUpdate', function() {
    var check = $location.search();
    if (
      current.id == check.id &&
      current.template == check.template
    ) {
      return;
    }
    current = check;
    if (current.id && current.template) {
      vm.getPage(current);
      return;
    }
    if(current.template){
      vm.selectTemplate({
        id: current.template
      });
      return;
    }
    vm.restart();

  });

};
