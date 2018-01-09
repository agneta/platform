(function() {

  agneta.directive('AgAccountAddCert', function(data, Upload, $mdDialog, $rootScope) {

    var vm = this;
    var object;

    agneta.extend(vm,'AgDialogCtrl', {
      data: data
    });

    vm.formCertFields = data.fields;

    vm.uploadPFX = function(_object) {

      object = _object;

    };

    vm.submit = function(){

      var modelName = $rootScope.portal.getMethod('account');

      var uploadData = {
        object: object,
        accountId: data.accountId
      };

      angular.extend(uploadData,vm.formCertFields);

      var promise = Upload.upload({
        url: agneta.url_api(modelName+'/cert-add'),
        method: 'POST',
        arrayKey: '',
        data: uploadData
      });

      data.onSubmit(promise);

    };

  });

})();
