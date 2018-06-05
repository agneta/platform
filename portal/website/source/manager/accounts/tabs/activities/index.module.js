agneta.directive('AgAccountActivities',function(AccountList){

  var vm = this;

  vm.$on('account-loaded',load);

  if(vm.viewAccount){
    load();
  }

  function load(){
    AccountList.model.activities({
      accountId: vm.viewAccount.id,
      aggregate: 'dayOfYear'
    })
      .$promise
      .then(function(result) {
        vm.activities = result.activities;
      });
  }

});
