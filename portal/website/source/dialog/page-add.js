(function() {

  agneta.directive('AgPageAdd', function(data, Portal) {

    var scopeEdit = data.scopeEdit;
    var helpers = data.helpers;
    var vm = this;

    agneta.extend(vm, 'AgDialogCtrl');

    if (!scopeEdit.template) {
      return;
    }

    var defaultPath = scopeEdit.page && scopeEdit.page.path;
    if (!defaultPath) {
      defaultPath = scopeEdit.template.path_default || '';
      defaultPath += '/old-file-name';
    }

    defaultPath = defaultPath.split('/');
    defaultPath.pop();
    defaultPath = defaultPath.join('/');
    defaultPath = agneta.urljoin(defaultPath, 'new-file-name');

    if (defaultPath[0] != '/')
      defaultPath = '/' + defaultPath;

    vm.formSubmitFields = {
      path: defaultPath
    };

    vm.template = scopeEdit.template;

    vm.submit = function() {

      var fields = vm.formSubmitFields;
      vm.loading = true;

      helpers.Model.new({
        title: fields.title,
        path: fields.path,
        template: vm.template.id
      })
        .$promise
        .then(function(result) {
          helpers.toast(result.message || 'File created');

          Portal.socket.once('page-reload', function() {
            return scopeEdit.getPage(result.id)
              .then(function() {
                vm.close();
                return scopeEdit.selectTemplate();
              })
              .finally(function() {
                vm.loading = false;
              });
          });

        });

    };

  });
})();
