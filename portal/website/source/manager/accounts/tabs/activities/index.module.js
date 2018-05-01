agneta.directive('AgAccountActivities',function(AccountList){

  var vm = this;
  console.log('haahha');
  vm.$on('account-loaded',function(event, account){
    onAccount(account);
  });

  if(vm.viewAccount){
    onAccount(vm.viewAccount);
  }

  function onAccount(account){
    AccountList.model.activities({
      accountId: account.id,
      aggregate: 'dayOfYear'
    })
      .$promise
      .then(function(result) {
        vm.activities = result.activities;
      });
  }

});
