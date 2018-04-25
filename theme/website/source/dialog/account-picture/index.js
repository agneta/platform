agneta.directive('AgAccountPicture',function(Upload) {
  var vm = this;

  vm.upload = function(object) {

    if (object) {
      var endpoint = agneta.url(agneta.services.url ,'api/account/picture-change');
      console.log(endpoint);
      Upload.upload({
        url: endpoint,
        data: {
          object: object
        },
        arrayKey: ''
      }).then(function(response) {
        console.log(response);
      });
    }
  };

});
