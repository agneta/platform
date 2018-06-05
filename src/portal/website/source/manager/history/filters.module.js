/*global moment*/

module.exports = function(options){

  var vm = options.vm;

  vm.changeType = function(type) {
    vm.type = type;
    vm.changedType();
  };

  vm.changedType = function() {
    vm.page.feedSelected = null;
    vm.loadTotals();
  };

  vm.changedPeriod = function(_value) {

    ////////////////////////////////////////////////////////////
    var value;
    var values = [];
    var now = moment();
    var tmp = moment();
    var i;

    switch (vm.page.periodSelected) {
      case 'year':
        for (i = 0; i < 10; i++) {
          var id = now.year() - i;
          values.push({
            id: id,
            label: id
          });
        }
        value = now.year();
        break;
      case 'month':
        for (i = 0; i < 12; i++) {

          values.push({
            id: i,
            label: tmp.month(i).format('MMMM')
          });

        }
        value = now.month();
        break;

      case 'dayOfYear':

        var start = tmp.date(1).dayOfYear();
        var end = tmp.endOf('month').dayOfYear() + 1;

        for (i = start; i < end; i++) {

          values.push({
            id: i,
            label: tmp.dayOfYear(i).format('DD dddd')
          });

        }
        value = now.dayOfYear();
        break;

    }

    vm.values = values;
    vm.page.valueSelected = _value || value;

    vm.loadTotals();
  };
};
