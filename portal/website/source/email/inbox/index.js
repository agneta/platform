agneta.directive('AgEmailInbox', function(Contact_Email, $sce) {
  var vm = this;
  var accounts = (vm.accounts = {});
  var email = (vm.email = {});

  accounts.load = function() {
    Contact_Email.inboxAccounts().$promise.then(function(result) {
      //console.log(result);
      accounts.list = result.list;
    });
  };

  accounts.loadEmails = function() {
    if (!accounts.selected) {
      return;
    }
    Contact_Email.inboxList({
      addressId: accounts.selected._id
    }).$promise.then(function(result) {
      if(!angular.equals(email.list,result.list)){
        email.list = result.list;
      }
      //console.log(result);
    });
  };

  setInterval(accounts.loadEmails, 5000);

  accounts.open = function(account) {
    accounts.selected = account;
    accounts.loadEmails();
  };

  accounts.close = function() {
    accounts.selected = null;
    email.selected = null;
    email.list = null;
    accounts.load();
  };

  email.open = function(item) {
    email.selected = item;
    Contact_Email.inboxLoad({
      emailId: item.id
    }).$promise.then(function(result) {
      $sce.trustAsHtml(result.html);
      email.data = result;
    });
  };

  accounts.load();
});
