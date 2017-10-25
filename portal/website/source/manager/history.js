/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/source/manager/history.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/*global moment*/
/*global Chart*/
/*global UAParser*/

(function() {

  var app = angular.module('MainApp');
  var chart;

  var formats = {
    month: 'MMMM',
    dayOfYear: 'ddd DD',
    hourOfYear: 'ha'
  };

  app.controller('HistoryCtrl', function($scope, $ocLazyLoad, $rootScope, $mdDialog, $mdSidenav, $timeout, Production_Activity_Count, Activity_Count, Production_Activity_Item, Portal, Activity_Item) {

    var Model_Count = $rootScope.isProduction() ? Production_Activity_Count : Activity_Count;
    var Model_Item = $rootScope.isProduction() ? Production_Activity_Item : Activity_Item;

    $scope.$on('productionMode', function(evt, enabled) {
      if (enabled) {
        Model_Count = Production_Activity_Count;
        Model_Item = Production_Activity_Item;
      } else {
        Model_Count = Activity_Count;
        Model_Item = Activity_Item;
      }
      $scope.loadTotals();
    });

    //-----------------------------------------

    var feedData;
    var utc;

    $scope.page = {
      feedSelected: null
    };
    $scope.type = 'view_page';

    $ocLazyLoad.load({
      name: 'angularMoment',
      files: [agneta.get_lib('angular-moment.min.js')]
    });

    /////////////////////////////////////////////////////////////

    $scope.selectFeed = function(feed) {
      $scope.page.feedSelected = feed;
      $scope.loadTotals();
    };

    /////////////////////////////////////////////////////////////

    var socketListeners = [];
    var timeOffset = parseInt(moment().utcOffset() / 60);

    $scope.loadTotals = function() {

      if ((!$scope.page.feedSelected && !$scope.type) || !$scope.page.periodSelected) {
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

      $scope.progressMode = 'indeterminate';

      var chartData = {
        datasets: []
      };


      if ($scope.page.feedSelected) {

        return Model_Count.totals({
          feed: $scope.page.feedSelected.id,
          period: $scope.page.periodSelected,
          value: $scope.page.valueSelected
        })
          .$promise
          .then(function(result) {
            $scope.progressMode = 'determinate';
            result.color = $scope.page.feedSelected.color;

            onLoaded(result);
            loadLabels(result, result.counts);
            addFeed(result);
            updateChart();
          });

      } else if ($scope.type) {

        var query = {
          type: $scope.type,
          period: $scope.page.periodSelected,
          value: $scope.page.valueSelected
        };

        return Model_Count.totalsByType(query)
          .$promise
          .then(function(result) {

            if (!result.feeds.length) {
              $scope.feeds = null;
              return;
            }

            onLoaded(result);
            loadLabels(result, result.feeds[0].counts);

            for (var i in result.feeds) {
              var feed = result.feeds[i];
              addFeed(feed);
            }

            updateChart();
            $scope.feeds = result.feeds;

          })
          .finally(function() {
            $scope.progressMode = 'determinate';
          });

      }

      function onLoaded(res) {

        feedData = res;


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
          backgroundColor: 'rgba(' + rgb + ',.4)',
          borderColor: 'rgba(' + rgb + ',.7)',
          borderCapStyle: 'butt',
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
            period: $scope.page.periodSelected,
            value: $scope.page.valueSelected
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

    $scope.onChartClick = function(e) {

      var activeElm = chart.getElementAtEvent(e);

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

        $mdDialog.show({
          clickOutsideToClose: true,
          templateUrl: agneta.partial('activities'),
          locals: {
            data: {
              feed: $scope.page.feedSelected.id,
              unit: feedData.unit,
              value: count.key
            }
          },
          controller: 'ActivitiesCtrl'
        });

        return;
      }

      $scope.page.periodSelected = feedData.unit;
      $scope.unit = feedData.subUnit;

      $scope.changedPeriod(count.key);

    };

    //------------------------------------------------------

    $scope.showActivities = function(feed) {

      $mdDialog.open({
        partial: 'activities',
        data: {
          feed: feed.id,
          unit: $scope.page.periodSelected,
          value: $scope.page.valueSelected,
          Model_Item: Model_Item
        },
        controller: 'ActivitiesCtrl'
      });

    };

    //------------------------------------------------------

    $scope.changeType = function(type) {
      $scope.type = type;
      $scope.changedType();
    };

    $scope.changedType = function() {
      $scope.page.feedSelected = null;
      $scope.loadTotals();
    };

    $scope.changedPeriod = function(_value) {

      ////////////////////////////////////////////////////////////
      var value;
      var values = [];
      var now = moment();
      var tmp = moment();
      var i;

      switch ($scope.page.periodSelected) {
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

      $scope.values = values;
      $scope.page.valueSelected = _value || value;

      $scope.loadTotals();
    };

  });

  function initChart(data) {

    if (chart) {
      chart.clear();
      chart.destroy();
    }

    var ctx = document.getElementById('manager-history-canvas')
      .getContext('2d');

    chart = new Chart(ctx, {
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

  ///////////////////////////////////////////////////////////////////////////

  app.controller('ActivitiesCtrl', function($rootScope, $scope, $mdDialog, $controller, data) {

    angular.extend(this, $controller('DialogCtrl', {
      $scope: $scope
    }));

    $scope.loading = true;
    var time = moment().utc().dayOfYear(data.value);
    $scope.time = time;


    data.Model_Item.latest(data)
      .$promise
      .then(function(result) {
        $scope.loading = false;
        $scope.data = result;
      });

    $scope.modal = function(activity) {
      $mdDialog.open({
        nested: true,
        partial: activity.modal,
        data: {
          activity: activity,
          Model_Item: data.Model_Item
        }
      });
    };

    $scope.loadActivity = function(activity) {

      $mdDialog.open({
        nested: true,
        partial: 'activity',
        data: {
          activity: activity,
          Model_Item: data.Model_Item
        },
        controller: 'ActivityCtrl'
      });

    };

  });

  ///////////////////////////////////////////////////////////////////////////

  app.controller('ActivityCtrl', function($rootScope, $scope, $mdDialog, $controller, data) {

    angular.extend(this, $controller('DialogCtrl', {
      $scope: $scope
    }));

    $scope.loading = true;

    data.Model_Item.details({
      id: data.activity.id
    })
      .$promise
      .then(function(result) {
        $scope.loading = false;

        if (!result) {
          return;
        }

        $scope.title = data.activity.title;
        $scope.time = result.time;
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

        $scope.data = result.data;


      });

  });
})();
