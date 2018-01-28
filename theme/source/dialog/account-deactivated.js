agneta.directive('AgAccountDeactivated', function(Account, $mdDialog, email) {

  var vm = this;

  agneta.extend(vm, 'AgDialogCtrl');

  vm.action = function() {

    vm.loading = true;

    Account.requestRecovery({
      email: email
    });
  };

});
