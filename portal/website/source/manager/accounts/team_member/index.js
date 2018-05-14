agneta.directive('AgTeamMember',function(AccountList) {

  var vm = this;
  var teamMember = vm.teamMember = {};

  function load(){
    AccountList.model.teamMemberGet({
      accountId: vm.viewAccount.id
    })
      .$promise
      .then(function(result) {
        teamMember.data = result;
      });
  }

  vm.$on('account-loaded',load);

  if(vm.viewAccount){
    load();
  }

  teamMember.save = function() {

    AccountList.model.teamMemberUpdate({
      id: teamMember.data.id,
      data: {
        position: teamMember.data.position
      }
    })
      .$promise
      .then(function() {

        vm.reloadAccount();

      });
  };

});
