agneta.directive('AgPasswordChange', function($rootScope, $mdDialog, LoopBackAuth, Account, data) {

  var vm = this;

  agneta.extend(vm, 'AgDialogCtrl');

  vm.submitPassword = function() {
    console.log(data);
    vm.loading = true;
    vm.formPassFields[agneta.token] =  data.token;

    Account.passwordChange(vm.formPassFields)
      .$promise
      .then(function(res) {

        vm.loading = false;
        var credentials = {
          email: res.email,
          password: vm.formPassFields.password_new
        };
        $rootScope.signIn(credentials);

      });

  };

});
