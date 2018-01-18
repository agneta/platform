agneta.directive('AgDialogConfirm', function($rootScope, data, $mdDialog) {

  var vm = this;

  vm.confirm = function() {
    if (data.onConfirm) {
      data.onConfirm();
    }
    $mdDialog.hide();
  };
  vm.reject = function() {
    if (data.onReject) {
      data.onReject();
    }
    $mdDialog.hide();
  };

});
