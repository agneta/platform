agneta.directive('AgUploadPicture',function(data, Upload){
  var vm = this;
  vm.upload = function(object){
    if (!object) {
      return;
    }
    console.log(data.account);
    Upload.upload({
      url: agneta.url_api(data.method),
      data: {
        accountId: data.account.id,
        object: object
      }
    }).then(function(response) {
      console.log(response);
    });

  };
});
