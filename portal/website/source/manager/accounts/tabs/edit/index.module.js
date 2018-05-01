module.exports = function(shared) {

  var vm = shared.vm;
  var AccountList = shared.AccountList;
  var $mdDialog = shared.$mdDialog;
  var reloadAccount = shared.reloadAccount;
  var $mdToast = shared.$mdToast;

  var edit = vm.edit = {};

  edit.save = function() {
    AccountList.model.update({
      data: vm.viewAccount
    })
      .$promise
      .then(function() {

        reloadAccount();
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
          reloadAccount();
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
          reloadAccount();
        });
    }, function() {});

  };

};
