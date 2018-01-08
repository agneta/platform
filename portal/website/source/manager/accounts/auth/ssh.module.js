module.exports = function(options) {

  var ssh = {};
  var vm = options.vm;
  var AccountList = options.AccountList;
  var $mdDialog = options.$mdDialog;

  vm.ssh = ssh;

  ssh.load = function() {

    ssh.loading = true;

    AccountList.model.sshList({
      accountId: vm.viewAccount.id
    })
      .$promise
      .then(function(result) {
        console.log(result);
        vm.ssh.keys = result.keys;
      })
      .finally(function() {
        ssh.loading = false;
      });

  };

  ssh.open = function() {};

  ssh.add = function() {

    $mdDialog.open({
      partial: 'account-add-ssh',
      data: {
        onSubmit: function(form) {

          ssh.loading = true;

          AccountList.model.sshAdd({
            accountId: vm.viewAccount.id,
            title: form.title,
            content: form.content
          })
            .$promise
            .finally(function() {
              ssh.load();
              ssh.loading = false;
            });

        }
      }
    });


  };

  ssh.remove = function(key) {

    var confirm = $mdDialog.confirm()
      .title('Remove Key')
      .textContent('Are you sure you want to remove this ssh key?')
      .ok('Yes')
      .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {

      ssh.loading = true;

      AccountList.model.sshRemove({
        accountId: vm.viewAccount.id,
        keyId: key.id
      })
        .$promise
        .finally(function() {
          ssh.load();
          ssh.loading = false;
        });

    });
  };
};
