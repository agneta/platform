agneta.directive('AgResendVrfCtrl', function(Account, $mdDialog, data) {

  var vm = this;

  agneta.extend(vm, 'AgDialogCtrl');

  vm.data = {
    content: data.html
  };

  vm.action = function() {
    vm.loading = true;
    Account.resendVerification({
      email: data.email
    });
  };

});
