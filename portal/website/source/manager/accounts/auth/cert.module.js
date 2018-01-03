module.exports = function(options) {

  var cert = {};
  var vm = options.vm;
  var AccountList = options.AccountList;
  var $mdDialog = options.$mdDialog;

  vm.cert = cert;

  cert.load = function() {

    cert.loading = true;

    AccountList.model.sshList({
      accountId: vm.viewAccount.id
    })
      .$promise
      .then(function(result) {
        console.log(result);
        vm.cert.keys = result.keys;
      })
      .finally(function() {
        cert.loading = false;
      });

  };

  cert.open = function() {};

  cert.add = function() {

    $mdDialog.open({
      partial: 'cert-add-key',
      data: {
        onSubmit: function(form) {

          cert.loading = true;

          AccountList.model.sshAdd({
            accountId: vm.viewAccount.id,
            title: form.title,
            content: form.content
          })
            .$promise
            .finally(function() {
              cert.load();
              cert.loading = false;
            });

        }
      }
    });


  };

  cert.remove = function(key) {

    var confirm = $mdDialog.confirm()
      .title('Remove certificate')
      .textContent('Are you sure you want to remove this certificate?')
      .ok('Yes')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {

      cert.loading = true;

      AccountList.model.sshRemove({
        accountId: vm.viewAccount.id,
        keyId: key.id
      })
        .$promise
        .finally(function() {
          cert.load();
          cert.loading = false;
        });

    });
  };
};
