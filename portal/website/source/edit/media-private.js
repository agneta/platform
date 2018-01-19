agneta.directive('AgMediaPrivate',function(AgMedia){
  AgMedia.init({
    vm: this,
    config: AgMedia.private
  });
});
