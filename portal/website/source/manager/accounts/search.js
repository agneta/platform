
(function() {

  var app = angular.module('MainApp');

  app.controller('SearchAccounts', function($scope, AccountList, $rootScope, $mdDialog, Production_Account, Account, $location) {

    AccountList.useScope($scope);

    var filters = {};

    $scope.select = function(account){
      $location.path(agneta.langPath('manager/accounts')).search({
        account: account.id
      });
    };

    $scope.filter = function(){

      $mdDialog.open({
        partial: 'filter-account',
        data:{
          filters: filters,
          onApply: function(filters){
            console.log(filters);

            var options = {};

            for(var key in filters){
              var filter = filters[key];
              if(filter.enabled){
                options[key] = filter.value || false;
              }
            }

            return AccountList.model.filter({
              options: options
            })
              .$promise
              .then(function(result){

                AccountList.loadAccounts(result);

                console.log(result);
              });
          }
        }
      });
    };

  });

})();
