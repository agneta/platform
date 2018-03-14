/*global XLSX*/
/*global saveAs*/
/*global moment*/

module.exports = function(options){

  var vm = options.vm;

  function getWorkbook(){

    var ws_name = 'Report';

    var wb = {
      SheetNames: [ws_name],
      Sheets: {}
    };
    var data = options.feedData;
    console.log(data);
    var header = ['Name','Description','Total','']
      .concat(options.chartData.labels);
    var feedRows = [header];

    for(var feed of data.feeds){
      var row = [
        feed.title, feed.subtitle, feed.total, ''
      ];
      for(var count of feed.counts){
        row.push(count.total);
      }
      feedRows.push(row);
    }

    var ws_data = [
      [ 'Year', data.year],
      [ 'Period', data.period,
        moment()[data.period](data.value)
          .format(options.formats[data.period])
      ],
      []
    ].concat(feedRows);

    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    wb.Sheets[ws_name] = ws;

    return wb;
  }


  vm.export = function() {
    var workbook = getWorkbook();

    var wbout = XLSX.write(workbook, {
      bookType: 'xlsx',
      bookSST: false,
      type: 'binary'
    });

    function s2ab(s) {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }

    /* the saveAs call downloads a file on the local machine */
    saveAs(new Blob([s2ab(wbout)], {
      type: 'application/octet-stream'
    }), 'report.xlsx');

  };

};
