(function() {

  agneta.directive('AgRoleAdd', function(AccountList, data) {

    var vm = this;

    agneta.extend(vm, 'AgDialogCtrl');
    vm.data = data;


    vm.submit = function() {

      vm.loading = true;

      AccountList.model.roleAdd({
        id: data.account.id,
        name: vm.role
      })
        .$promise
        .finally(function() {

          vm.loading = false;
          data.reloadAccount();

        });
    };

  });
})();
