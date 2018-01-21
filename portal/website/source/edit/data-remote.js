(function() {

  agneta.directive('AgEditDataRemote', function(Data_Remote) {
    var vm = this;
    agneta.extend(vm, 'AgEditMainCtrl');

    vm.init({
      model: Data_Remote,
      mediaRoot: 'data',
      isRemote: true
    });

  });

})();
