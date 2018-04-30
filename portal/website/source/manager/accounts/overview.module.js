module.exports = function(shared) {

  var vm = shared.vm;
  var AccountList = shared.AccountList;
  var $mdDialog = shared.$mdDialog;
  var overview = vm.overview = {};
  var reloadAccount = shared.reloadAccount;

  overview.resendVerification = function() {
    AccountList.model.resendVerification({
      email: vm.viewAccount.email
    });
  };

  overview.changePicture = function(){
    $mdDialog.open({
      partial: 'account-file',
      data:{
        model: AccountList.model,
        query: {
          accountId: vm.viewAccount.id,
          location: 'profile'
        },
        method: 'role-account-manager/media-upload',
        onUploaded: function() {
          reloadAccount();
          AccountList.loadAccounts();
        }
      }
    });
  };

};
