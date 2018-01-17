agneta.directive('AgMediaSelect', function(data, $mdDialog) {

  var vm = this;

  vm.startingLocation = data.file.dir;

  vm.openObject = function(object) {
    data.onSelect(object);
    $mdDialog.hide();
  };

  vm.onObjects = function(objects) {
    for (var index in objects) {
      var object = objects[index];
      if (object.location == data.file.location) {
        object.selected = true;
        break;
      }
    }
  };

  agneta.extend(vm, 'AgMediaCtrl',{
    MediaOpt: data.media
  });

});
