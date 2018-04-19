agneta.directive('AgUploadPicture',function(data){
  console.log('hello',data);
  var vm = this;
  vm.upload = function(data){
    console.log(data);
  };
});
