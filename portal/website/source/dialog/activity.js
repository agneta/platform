/*global UAParser*/

agneta.directive('AgActivityCtrl', function($rootScope, $mdDialog, data) {

  var vm = this;

  agneta.extend(vm, 'AgDialogCtrl');

  vm.loading = true;

  data.Model_Item.details({
    id: data.activity.id
  })
    .$promise
    .then(function(result) {
      vm.loading = false;

      if (!result) {
        return;
      }

      vm.title = data.activity.title;
      vm.time = result.time;
      //------------------------------------------

      if (result.data.request) {

        var agent = result.data.request.agent;
        var parser = new UAParser();
        parser.setUA(agent);
        agent = parser.getResult();

        angular.extend(result.data.request, {
          browser: agent.browser.name + ' ' + agent.browser.major,
          device: agent.device.name,
          os: agent.os.name
        });

      }

      vm.data = result.data;


    });

});
