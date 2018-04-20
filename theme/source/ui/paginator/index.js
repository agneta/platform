var app = angular.module('MainApp');

app.directive('agUiPaginator', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(vm, element, attrs, ngModel) {
      if (!ngModel) return;
      console.log(attrs);

      var paginator = vm.paginator = {};

      paginator.next = function(){

        paginator.index += paginator.limit;
        if(paginator.index>=paginator.count){
          paginator.index = paginator.count - paginator.limit;
        }
      };

      paginator.previous = function(){
        paginator.index -= paginator.limit;

        if(paginator.index<0){
          paginator.index = 0;
        }

      };

      vm.$watch('paginator.index',function(newValue){
        vm.paginator.current = parseInt(newValue / paginator.limit) + 1;
        vm.paginator.total = parseInt(paginator.count/paginator.limit)+1;
      });

      // Make the call

      var data;
      vm.$watch(attrs.ngModel, function(_data) {

        data = _data;

        if(!data){
          return;
        }

        paginator.limits = data.limits || [10,25,50];
        paginator.limit = paginator.limits[0];
        query();
      });

      function query(){
        data.loading = true;
        data.method(angular.extend({
          skip: paginator.index,
          limit: paginator.limit
        },data.query))
          .$promise
          .then(function(result){
            paginator.count = result.count;
            data.list = result.list;
          })
          .finally(function(){
            data.loading = false;
          });
      }

    }
  };
});
