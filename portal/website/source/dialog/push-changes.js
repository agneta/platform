(function() {

  agneta.directive('AgPushChanges', function(GIT, data) {
    var vm = this;
    var helpers = data.helpers;

    agneta.extend(vm, 'AgDialogCtrl');

    vm.loading = true;
    GIT.status()
      .$promise
      .then(function(result) {
        //console.log(result);
        vm.files = result.files;
      })
      .finally(function() {
        vm.loading = false;
      });

    vm.submit = function() {
      vm.loading = true;
      GIT.push({
        message: vm.formSubmitFields.message
      })
        .$promise
        .then(function() {
          vm.close();
          helpers.toast('Changes are pushed to repository');
        })
        .finally(function() {
          vm.loading = false;
        });
    };
  });

})();
