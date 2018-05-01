agneta.directive('AgTeamMember',function(AccountList) {

  var vm = this;
  var teamMember = vm.teamMember = {};

  teamMember.save = function() {
    var teamMember = vm.viewAccount.role.team_member;

    AccountList.model.teamMemberUpdate({
      id: teamMember.id,
      data: {
        position: teamMember.position
      }
    })
      .$promise
      .then(function() {

        vm.reloadAccount();

      });
  };

});
