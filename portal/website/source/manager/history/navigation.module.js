module.exports = function(options){

  var vm = options.vm;
  var Model_Item = options.Model_Item;
  var $mdDialog = options.$mdDialog;

  vm.onChartClick = function(e) {

    var activeElm = options.chart.getElementAtEvent(e);
    var feedData = options.feedData;

    if (!activeElm.length) {
      return;
    }

    activeElm = activeElm[0];
    var count;
    if (feedData.feeds) {
      count = feedData.feeds[0].counts[activeElm._index];
    } else {
      count = feedData.counts[activeElm._index];
    }

    if (!feedData.subUnit) {

      $mdDialog.open({
        partial: 'activities',
        data: {
          feed: vm.page.feedSelected.id,
          unit: feedData.unit,
          value: count.key
        }
      });

      return;
    }

    vm.page.periodSelected = feedData.unit;
    vm.unit = feedData.subUnit;

    vm.changedPeriod(count.key);

  };

  //------------------------------------------------------

  vm.showActivities = function(feed) {

    $mdDialog.open({
      partial: 'activities',
      data: {
        feed: feed.id,
        unit: vm.page.periodSelected,
        value: vm.page.valueSelected,
        Model_Item: Model_Item
      }
    });

  };

};
