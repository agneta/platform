/*global moment*/
/*global Chart*/

module.exports = function(options){

  var vm = options.vm;
  var Portal = options.Portal;
  var Model_Count = options.Model_Count;
  var formats = options.formats;
  var chart;
  var socketListeners = [];
  var timeOffset = parseInt(moment().utcOffset() / 60);
  var utc;

  vm.loadTotals = function() {

    if ((!vm.page.feedSelected && !vm.type) || !vm.page.periodSelected) {
      return;
    }

    for (var key in socketListeners) {
      Portal.socket.removeAllListeners(socketListeners[key]);
    }

    socketListeners = [];

    utc = moment().utc();
    utc.hours(0);
    utc.minutes(0);
    utc.seconds(0);

    vm.progressMode = 'indeterminate';

    var chartData = options.chartData = {
      datasets: []
    };


    if (vm.page.feedSelected) {

      return Model_Count.totals({
        feed: vm.page.feedSelected.id,
        period: vm.page.periodSelected,
        value: vm.page.valueSelected
      })
        .$promise
        .then(function(result) {
          vm.progressMode = 'determinate';
          result.color = vm.page.feedSelected.color;

          onLoaded(result);
          loadLabels(result, result.counts);
          addFeed(result);
          updateChart();
        });

    } else if (vm.type) {

      var query = {
        type: vm.type,
        period: vm.page.periodSelected,
        value: vm.page.valueSelected,
        year: vm.page.yearSelected
      };

      return Model_Count.totalsByType(query)
        .$promise
        .then(function(result) {

          if (!result.feeds.length) {
            vm.feeds = null;
            return;
          }

          onLoaded(result);
          loadLabels(result, result.feeds[0].counts);

          for (var i in result.feeds) {
            var feed = result.feeds[i];
            addFeed(feed);
          }

          updateChart();
          vm.feeds = result.feeds;

        })
        .finally(function() {
          vm.progressMode = 'determinate';
        });

    }

    function onLoaded(res) {
      options.feedData = res;
    }

    function loadLabels(res, counts) {

      var labels = [];
      var offset = 0;

      switch (res.unit) {
        case 'hourOfYear':
          offset += timeOffset;
          break;
      }

      for (var index in counts) {

        var count = counts[index];
        var key = count.key + offset;
        var label = utc[res.unit](key).format(formats[res.unit]);

        labels.push(label);
      }

      chartData.labels = labels;
    }

    function feedValues(res) {
      var values = [];

      for (var key in res.counts) {
        var count = res.counts[key];
        values.push(count.total);
      }

      return values;
    }

    function addFeed(res) {

      var values = feedValues(res);
      var rgb = res.color.join(',');

      var dataset = {
        fill: true,
        type: 'line',
        backgroundColor: 'rgba(' + rgb + ',.1)',
        borderColor: 'rgba(' + rgb + ',1)',
        borderCapStyle: 'butt',
        borderWidth: 2,
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        data: values,
      };
      if (!res.$promise) {

        res.rgb = rgb;
        dataset.label = res.title || res.value;

      }

      //
      var listener = 'feed-update:' + res.id;

      socketListeners.push(listener);
      Portal.socket.on(listener, function() {

        Model_Count.totals({
          feed: res.id,
          period: vm.page.periodSelected,
          value: vm.page.valueSelected
        })
          .$promise
          .then(function(result) {

            dataset.data = feedValues(result);
            chart.update();
            res.total = result.total;
            //console.log('update!', result);

          });

      });

      //

      chartData.datasets.push(dataset);


    }

    function updateChart() {
      initChart(chartData);
    }
  };


  function initChart(data) {

    if (chart) {
      chart.clear();
      chart.destroy();
    }

    var ctx = document.getElementById('manager-history-canvas')
      .getContext('2d');

    chart = options.chart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        pan: {
          enabled: true,
          mode: 'x'
        },
        zoom: {
          enabled: true,
          mode: 'x',
        },
        scales: {
          xAxes: [{
            stacked: true
          }],
          yAxes: [{
            ticks: {
              min: 0,
              suggestedMin: 1,
              maxTicksLimit: 6
            }
          }]
        },
        tooltips: {
          bodyFontSize: 16,
          xPadding: 6,
          yPadding: 14,
          callbacks: {
            title: function() {},
            label: function(tooltipItems, data) {
              var datasetLabel = data.datasets[tooltipItems.datasetIndex].label;
              if (datasetLabel) {
                return datasetLabel + ': ' + tooltipItems.yLabel;
              }

              return tooltipItems.yLabel;
            }
          }
        },
        legend: {
          display: false,
          labels: {}
        }
      }

    });

  }

};
