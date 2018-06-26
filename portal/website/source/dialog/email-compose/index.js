agneta.directive('AgEmailCompose', function(Contact_Email, AgMedia, data) {
  var vm = this;
  vm.to = data.to || [];

  vm.newContact = function(chip) {
    return {
      address: chip,
      name: ''
    };
  };

  vm.attachment = function() {
    AgMedia.explorer({
      type: 'private',
      data: {
        dir: 'email/attachments-send',
        onApply: function(object) {
          console.log(object);
        }
      }
    });
  };

  vm.send = function() {
    vm.loading = true;
    Contact_Email.send({
      to: vm.to,
      subject: vm.subject,
      message: vm.message
    }).$promise.finally(function() {
      vm.loading = false;
    });
  };
});
