module.exports = function(options) {

  var ip = {};
  var vm = options.vm;
  var AccountList = options.AccountList;
  var $mdDialog = options.$mdDialog;

  vm.ip = ip;

  ip.load = function() {

    ip.loading = true;

    AccountList.model.ipList({
      accountId: vm.viewAccount.id
    })
      .$promise
      .then(function(result) {
        console.log(result);
        vm.ip.list = result.list;
      })
      .finally(function() {
        ip.loading = false;
      });

  };

  ip.open = function() {};

  ip.add = function() {

    $mdDialog.open({
      partial: 'account-add-ip',
      data: {
        onSubmit: function(form) {

          ip.loading = true;

          AccountList.model.ipAdd({
            accountId: vm.viewAccount.id,
            title: form.title,
            address: form.address
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
