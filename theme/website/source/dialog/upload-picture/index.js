agneta.directive('AgUploadPicture',function(data, Upload){
  var vm = this;
  agneta.extend(vm, 'AgDialogCtrl');

  vm.account = data.account;

  //-----------------------------------
  // Media

  var media = vm.media = {};
  var mediaBase = `account/${data.account.id}/profile`;
  media.file = {};
  media.source = agneta.prv_media(mediaBase,'medium');
  media.url = agneta.prv_media(mediaBase);

  media.sharing = function(value){
    media.file.sharing = value;
  };

  media.upload = function(object){
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
