module.exports = function(options) {

  var cert = {};
  var vm = options.vm;
  var AccountList = options.AccountList;
  var $mdDialog = options.$mdDialog;

  vm.cert = cert;

  cert.load = function() {

    cert.loading = true;

    return AccountList.model.certList({
      accountId: vm.viewAccount.id
    })
      .$promise
      .then(function(result) {
        console.log(result);
        vm.cert.list = result.list;
      })
      .finally(function() {
        cert.loading = false;
      });

  };

  cert.open = function(fields) {

    $mdDialog.open({
      partial: 'account-edit-cert',
      data: {
        fields: fields,
        remove: remove,
        accountId: vm.viewAccount.id,
        onSubmit: onSubmit
      }
    });

  };

  cert.add = function() {

    $mdDialog.open({
      partial: 'account-add-cert',
      data: {
        accountId: vm.viewAccount.id,
        onSubmit: onSubmit
      }
    });

  };

  function onSubmit(promise) {
    cert.loading = true;
    promise
      .finally(function() {
        cert.load();
        cert.loading = false;
      });
  }

  function remove(id) {

    var confirm = $mdDialog.confirm()
      .title('Remove certificate')
      .textContent('Are you sure you want to remove this certificate?')
      .ok('Yes')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {

      cert.loading = true;

      AccountList.model.certRemove({
        accountId: vm.viewAccount.id,
        certId: id
      })
        .$promise
        .finally(function() {
          cert.load();
        });

    });
  }
};
