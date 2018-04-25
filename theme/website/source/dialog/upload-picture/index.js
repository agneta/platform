agneta.directive('AgUploadPicture',function(data, Upload){
  var vm = this;
  agneta.extend(vm, 'AgDialogCtrl');
  vm.upload = function(object){
    if (!object) {
      return;
    }
    vm.loading = true;

    var options = {
      url: agneta.url_api(data.method),
      data: {}
    };

    if(data.account){
      options.data.accountId = data.account.id;
    }

    options.data.object = object;

    console.log(options);

    Upload.upload(options)
      .then(function() {
        if(data.onUploaded){
          data.onUploaded();
        }
        vm.close();
      })
      .finally(function() {
        vm.loading = false;
      });
  };
});
