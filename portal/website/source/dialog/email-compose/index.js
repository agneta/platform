agneta.directive('AgEmailCompose',function(){
  var vm = this;

  vm.send = function() {
    console.log(vm.message);
  };
});
