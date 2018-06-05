var app = angular.module('MainApp');

app.directive('agUiPaginator', function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(vm, element, attrs, ngModel) {
      if (!ngModel) return;
      //console.log(attrs);

      var paginator = vm.paginator = {};

      paginator.next = function(){
        paginator.current++;
        query();
      };

      paginator.previous = function(){
        paginator.current--;
        query();
      };

      paginator.query = query;

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

        calculate();

        data.loading = true;
        data.method(angular.extend({
          skip: paginator.index,
          limit: paginator.limit
        },data.query))
          .$promise
          .then(function(result){
            paginator.count = result.count;
            data.list = result.list;
            if(data.onList){
              data.onList(result.list);
            }
            calculate();
          })
          .finally(function(){
            data.loading = false;
          });
      }

      function calculate(){

        paginator.count = paginator.count || 0;
        paginator.total = parseInt(paginator.count/paginator.limit)+1;
        //console.log(paginator.current, paginator.total);
        var current = paginator.current || 1;
        if(current<1){
          current = 1;
        }
        if(current>paginator.total){
          current = paginator.total;
        }
        var index = (current - 1) * paginator.limit;

        paginator.index = index;
        paginator.current = current;

      }

    }
  };
});
