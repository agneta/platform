agneta.directive('AgMediaPublic',function(AgMedia){
  AgMedia.init({
    vm: this,
    config: AgMedia.public
  });
});
