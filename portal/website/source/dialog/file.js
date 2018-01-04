
agneta.directive('AgEditFile', function(data, EditFile,MediaOpt) {

  var vm = this;

  agneta.extend(vm, 'AgDialogCtrl');

  data.config = data.config || {};

  //-------------------------------------------------------------

  data.media = data.media || MediaOpt.public;
  var MediaPreview = data.media.preview;

  //-------------------------------------------------------------

  if (data.location && !data.dir) {
    var dir = data.location.split('/');
    dir.pop();
    data.dir = dir.join('/');
  }

  vm.getIcon = function() {

    var icon = MediaPreview.objectIcon(vm.file);
    if (!icon) {
      icon = agneta.get_media('icons/agneta/media');
    }
    return icon;
  };

  EditFile.init({
    data: data,
    scope: vm,
    onFile: function(file) {
      //console.log('EditFile.init',file);
      if (file.location) {
        vm.preview_src = MediaPreview.image(file, 'medium');
      }

      if (data.onFile) {
        data.onFile(file);
      }
    }
  });

});
