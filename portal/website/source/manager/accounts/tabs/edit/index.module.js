agneta.directive('AgAccountEdit',function(AccountList, $mdDialog, $mdToast) {

  var vm = this;
  var edit = vm.edit = {};

  edit.save = function() {
    AccountList.model.update({
      data: vm.viewAccount
    })
      .$promise
      .then(function() {

        vm.reloadAccount();
        AccountList.loadAccounts();

        $mdToast.show({
          hideDelay: 5000,
          position: 'bottom right',
          templateUrl: 'toast-account.html'
        });
      });
  };

  edit.changePassword = function() {
    $mdDialog.open({
      partial: 'password-change-admin',
      data: {
        onFinally: function() {
          AccountList.loadAccounts();
        },
        account: vm.viewAccount
      }
    });
  };

  //------------------------------------------------------------

  edit.activateAccount = function() {

    var confirm = $mdDialog.confirm()
      .title('Activate Account')
      .textContent('Are you sure you want to activate this account?')
      .ok('Yes')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      AccountList.model.activate({
        id: vm.viewAccount.id
      })
        .$promise
        .then(function() {
          vm.reloadAccount();
        });
    }, function() {});

  };

  //------------------------------------------------------------

  edit.deactivateAccount = function() {

    var confirm = $mdDialog.confirm()
      .title('Deactivate Account')
      .textContent('Are you sure you want to deactivate this account?')
      .ok('Yes')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      AccountList.model.deactivate({
        id: vm.viewAccount.id
      })
        .$promise
        .then(function() {
          vm.reloadAccount();
        });
    }, function() {});

  };

});
