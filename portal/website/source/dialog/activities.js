/*global moment*/

agneta.directive('AgActivitiesCtrl', function($rootScope, $mdDialog, data) {

  var vm = this;

  agneta.extend(vm, 'AgDialogCtrl');

  vm.loading = true;
  var time = moment().utc().dayOfYear(data.value);
  vm.time = time;


  data.Model_Item.latest(data)
    .$promise
    .then(function(result) {
      vm.loading = false;
      vm.data = result;
    });

  vm.modal = function(activity) {
    $mdDialog.open({
      nested: true,
      partial: activity.modal,
      data: {
        activity: activity,
        Model_Item: data.Model_Item
      }
    });
  };

  vm.loadActivity = function(activity) {

    $mdDialog.open({
      nested: true,
      partial: 'activity',
      data: {
        activity: activity,
        Model_Item: data.Model_Item
      },
      controller: 'AgActivityCtrl'
    });

  };

});
