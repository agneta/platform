module.exports = function(shared) {

  var vm = shared.vm;
  var AccountList = shared.AccountList;
  var $mdDialog = shared.$mdDialog;
  var overview = vm.overview = {};

  overview.resendVerification = function() {
    AccountList.model.resendVerification({
      email: vm.viewAccount.email
    });
  };

  overview.changePicture = function(){
    $mdDialog.open({
      partial: 'upload-picture'
    });
  };

};
