agneta.directive('AgEmailInbox',function(Contact_Email) {

  var vm = this;
  var accounts = vm.accounts = {};
  var email = vm.email = {};

  accounts.load = function(){
    Contact_Email.inboxAccounts()
      .$promise
      .then(function(result) {
        console.log(result);
        accounts.list = result.list;
      });
  };

  accounts.open = function(account){
    accounts.selected = account;
    Contact_Email.inboxList({
      addressId: account._id
    })
      .$promise
      .then(function(result){
        email.list = result.list;
        console.log(result);
      });
  };

  accounts.close = function() {
    email.list = null;
    accounts.load();
  };

  email.open = function(item){
    email.selected = item;
    Contact_Email.inboxLoad({
      emailId: item.id
    })
      .$promise
      .then(function(result){
        email.data = result;
      });
  };

  accounts.load();

});
