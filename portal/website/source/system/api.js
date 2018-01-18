agneta.directive('AgSystemApi',function(API){

  var vm = this;

  vm.model = {};

  API.models({
  })
    .$promise
    .then(function(result) {
      vm.model.list = result.list;
    });

  vm.model.select = function(model){
    vm.model.selected = model.name;

    API.methods({
      name: model.name
    })
      .$promise
      .then(function(result) {
        console.log(result);
      });
  };

});
