var app = angular.module('MainApp');

app.service('AccountList', function($rootScope, Production_Account, Account, $timeout) {

  var AccountModel = $rootScope.isProduction() ? Production_Account : Account;
  var accounts = {};
  var search = {
    loading: false
  };
  var self = this;

  self.model = AccountModel;

  $rootScope.$on('productionMode', function(evt, enabled) {
    if (enabled) {
      AccountModel = Production_Account;
    } else {
      AccountModel = Account;
    }
    self.model = AccountModel;
    self.loadAccounts();
  });

  this.loadAccounts = function(result) {
    console.warn('loadAccounts');
    if (result) {
      accounts.list = result.accounts;
      accounts.count = result.count;
      return;
    }

    AccountModel.recent({
      limit: 20
    })
      .$promise
      .then(function(recent) {
        search.active = false;
        accounts.list = recent;
      });

  };

  if (!accounts.list) {
    self.loadAccounts();
  }

  search.query = function() {

    if (!search.text) {
      return;
    }
    search.loading = true;
    search.active = true;

    AccountModel.search({
      query: search.text
    })
      .$promise
      .then(function(result) {
        $timeout(function() {
          search.loading = false;
        }, 400);
        accounts.list = result.accounts;
      });
  };

  search.clear = function() {
    self.loadAccounts();
  };

  //------------------------------------

  self.useScope = function($scope) {

    $scope.search = search;
    $scope.accounts = accounts;

  };

});
