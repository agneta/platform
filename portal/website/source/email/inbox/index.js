agneta.directive('AgEmailInbox',function(Contact_Email) {

  var vm = this;

  Contact_Email.inboxAccounts()
    .$promise
    .then(function(result) {
      console.log(result);
      vm.accounts = result;
    });

  vm.onAccount = function(account){
    console.log(account);
  };

});
