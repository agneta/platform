agneta.directive('AgSystemApi',function(API){

  var vm = this;

  vm.model = {};
  vm.method = {};

  API.models({
  })
    .$promise
    .then(function(result) {
      vm.model.list = result.list;
    });

  vm.model.select = function(model){
    vm.model.selected = model;

    API.methods({
      name: model.name
    })
      .$promise
      .then(function(result) {
        vm.method.list = result.list;
      });
  };

  vm.method.select = function(method){
    vm.method.selected = method;
  };


});
