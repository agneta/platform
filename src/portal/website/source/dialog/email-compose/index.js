agneta.directive('AgEmailCompose',function(Contact_Email, data){
  var vm = this;
  vm.to = data.to;
  vm.send = function() {
    vm.loading = true;
    Contact_Email.send({
      to: vm.to,
      subject: vm.subject,
      message: vm.message
    })
      .$promise
      .finally(function(){
        vm.loading = false;
      });
  };
});
