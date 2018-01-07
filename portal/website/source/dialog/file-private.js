/*global Fuse*/

agneta.directive('AgEditFilePrivate', function(data, MediaOpt, Account) {

  var onFile = data.onFile;
  var vm = this;
  var items;
  var fuse;

  data.onFile = function(file) {
    file.roles = file.roles || [];
    if (onFile) {
      onFile(file);
    }
  };

  data.media = MediaOpt.private;

  vm.loading = true;
  Account.roles()
    .$promise
    .then(function(result) {
      vm.loading = false;

      items = result;
      fuse = new Fuse(items, {
        shouldSort: true,
        keys: ['name']
      });

    });

  var roles = {
    items: items,
    query: function(query) {
      if (!items) {
        return;
      }
      var results = query ? fuse.search(query) : items;

      var roles = [];
      for (var key in results) {
        roles.push(results[key].name);
      }

      return roles;
    }
  };

  vm.roles = roles;

  agneta.extend(vm, 'AgEditFile', {
    data: data
  });

});
