agneta.directive('AgEmailCompose', function(Contact_Email, AgMedia, data) {
  var vm = this;
  vm.to = data.to || [];
  vm.attachments = [];

  vm.newContact = function(chip) {
    return {
      address: chip,
      name: ''
    };
  };

  var baseDir = 'email/attachments-send';

  vm.attachment = function() {
    AgMedia.explorer({
      type: 'private',
      data: {
        dir: baseDir,
        onApply: function(object) {
          vm.attachments.push({
            filename: `${object.name}.${object.ext}`,
            location: object.location,
            size: object.size
          });
        }
      }
    });
  };

  vm.send = function() {
    vm.loading = true;
    var attachments = vm.attachments.map(function(attachment) {
      return attachment.location;
    });
    Contact_Email.send({
      to: vm.to,
      subject: vm.subject,
      message: vm.message,
      attachments: attachments
    }).$promise.finally(function() {
      vm.loading = false;
    });
  };
});
