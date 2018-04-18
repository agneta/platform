module.exports = function(shared) {

  var vm = shared.vm;
  var $location = shared.$location;
  var $q = shared.$q;

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
    $q.resolve()
      .then(function() {
        if(!current.template){
          return;
        }
        return vm.selectTemplate({
          id: current.template
        });
      })
      .then(function(){
        if (!current.id || !current.template) {
          return;
        }
        return vm.getPage(current);
      })
      .then(function(){
        if (current.id || current.template) {
          return;
        }
        vm.restart(true);
      });

  });

};
