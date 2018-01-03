module.exports = function(options) {

  var ip = {};
  var vm = options.vm;
  var AccountList = options.AccountList;
  var $mdDialog = options.$mdDialog;

  vm.ip = ip;

  ip.load = function() {

    ip.loading = true;

    AccountList.model.sshList({
      accountId: vm.viewAccount.id
    })
      .$promise
      .then(function(result) {
        console.log(result);
        vm.ip.keys = result.keys;
      })
      .finally(function() {
        ip.loading = false;
      });

  };

  ip.open = function() {};

  ip.add = function() {

    $mdDialog.open({
      partial: 'ip-add-key',
      data: {
        onSubmit: function(form) {

          ip.loading = true;

          AccountList.model.sshAdd({
            accountId: vm.viewAccount.id,
            title: form.title,
            content: form.content
          })
            .$promise
            .finally(function() {
              ip.load();
              ip.loading = false;
            });

        }
      }
    });


  };

  ip.remove = function(key) {

    var confirm = $mdDialog.confirm()
      .title('Remove ip address')
      .textContent('Are you sure you want to remove this ip address?')
      .ok('Yes')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {

      ip.loading = true;

      AccountList.model.sshRemove({
        accountId: vm.viewAccount.id,
        keyId: key.id
      })
        .$promise
        .finally(function() {
          ip.load();
          ip.loading = false;
        });

    });
  };
};
