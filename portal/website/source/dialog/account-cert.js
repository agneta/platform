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

    vm.update = function(){

      data.onSubmit(
        makeCall('cert-update')
      );

    };

    vm.submit = function(){

      data.onSubmit(
        makeCall('cert-add')
      );

    };

    function makeCall(method) {
      var modelName = $rootScope.portal.getMethod('account');

      var uploadData = {
        object: object,
        accountId: data.accountId
      };

      angular.extend(uploadData,vm.formCertFields);

      console.log(uploadData);

      return Upload.upload({
        url: agneta.url_api(modelName+'/'+method),
        method: 'POST',
        arrayKey: '',
        data: uploadData
      })
        .then(function() {
          vm.close();
        });
    }

  });

})();
