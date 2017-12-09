(function() {

  agneta.directive('AgAccountCreate', function(AccountList) {

    var vm = this;

    agneta.extend(vm, 'AgDialogCtrl');

    vm.submit = function() {
      vm.loading = true;
      AccountList.model.new(vm.formSubmitFields);
    };

  });

})();
