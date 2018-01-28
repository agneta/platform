agneta.directive('AgPasswordLost', function(data, Account) {

  var vm = this;

  agneta.extend(vm, 'AgDialogCtrl');

  vm.submit = function() {
    vm.loading = true;
    Account.requestPassword({
      email: vm.passLostFields.email,
      callback: data.callback
    }, function() {
      vm.loading = false;
    });
  };

});
