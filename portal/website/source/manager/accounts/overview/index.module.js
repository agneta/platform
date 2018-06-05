agneta.directive('AgAccountOverview',function(AccountList, $mdDialog) {

  var vm = this;
  var overview = vm.overview = {};

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
          vm.reloadAccount();
          AccountList.loadAccounts();
        }
      }
    });
  };

});
