module.exports = function(options) {

  var vm = options.vm;
  var AccountList = options.AccountList;
  var tokens = vm.tokens = {};

  tokens.load = function() {

    tokens.loading = true;

    AccountList.model.tokenList({
      accountId: vm.viewAccount.id
    })
      .$promise
      .then(function(result) {
        console.log(result);
        vm.tokens.list = result.list;
      })
      .finally(function() {
        tokens.loading = false;
      });

  };

};
