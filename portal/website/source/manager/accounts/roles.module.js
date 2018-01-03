module.exports = function(options){

  var vm = options.vm;
  var AccountList = options.AccountList;
  var $mdDialog = options.$mdDialog;
  var reloadAccount = reloadAccount;

  //---------------------------------------------------------

  vm.editRole = function(roleName) {

    $mdDialog.open({
      partial: 'role-' + roleName,
      data: {
        accountId: vm.viewAccount.id,
        roleName: roleName
      }
    });

  };

  //---------------------------------------------------------

  vm.removeRole = function(role) {

    var confirm = $mdDialog.confirm()
      .title('Role Removal')
      .textContent('Are you sure you want to remove this role?')
      .ok('Yes')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      AccountList.model.roleRemove({
        id: vm.viewAccount.id,
        name: role,
      })
        .$promise
        .then(function() {

          reloadAccount();

        });
    }, function() {});

  };

  //---------------------------------------------------------

  vm.addRole = function() {

    AccountList.model.roles()
      .$promise
      .then(function(roles) {

        $mdDialog.open({
          partial: 'role-add',
          data: {
            roles: roles,
            account: vm.viewAccount,
            reloadAccount: reloadAccount
          }
        });

      });

  };


};
