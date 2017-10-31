const chokidar = require('chokidar');
const fs = require('fs-extra');
const os = require('os');
const Promise = require('bluebird');

function Tail(filename, options) {

  options = Object.assign(options || {}, {
    alwaysStat: true,
    ignoreInitial: false,
    persistent: true,
  });

  var watcher;
  var fd;

  function closeFile() {
    return fs.close(fd);
  }

  function readLast() {
    var chunk = 3000;
    return fs.stat(filename)
      .then(function(stats) {
        return onChange(filename, chunk, stats.size - chunk);
      });
  }

  function watch() {

    var lastSize = 0;

    watcher = chokidar.watch(filename, options)
      .on('add', (path, stats) => {
        lastSize = stats.size;
      })
      .on('change', function(path, stats) {

        var diff = stats.size - lastSize;

        if (diff <= 0) {
          lastSize = stats.size;
          return;
        }

        onChange(path, diff, lastSize, stats)
          .then(function() {
            lastSize = stats.size;
          });
      })
      .on('unlink', () => {
        lastSize = 0;
        closeFile.bind(this);
      });
  }

  function onChange(path, diff, position) {

    const buffer = new Buffer(diff);
    fd = fs.openSync(path, 'r');

    return fs.read(fd, buffer, 0, diff, position)
      .then(function() {
        fs.closeSync(fd);
        var entries = buffer.toString('utf8').split('>> ');
        entries.shift(1);

        var entriesFinal = [];
        var lastEntry = {};

        return Promise.map(entries,function(entry) {
          entry = entry.split(' :: ');
          var date = entry[0];
          var message = entry[1];
          var lines = message.split(os.EOL);
          var linesFinal = [];
          return Promise.map(lines,function(line) {
            if(!line || !line.length){
              return;
            }
            linesFinal.push(line);
          })
            .then(function(){

              if(lastEntry.date!=date){

                lastEntry = {
                  date: date,
                  lines: linesFinal
                };

                entriesFinal.push(lastEntry);
                
              }else{
                lastEntry.lines = lastEntry.lines.concat(linesFinal);
              }
            });

        })
          .then(function(){
            return entriesFinal;
          });
      });

  }

  function close() {
    if (watcher) {
      watcher.unwatch(filename);
      watcher.close();
      watcher = undefined;
    }
  }

  return {
    close: close,
    watch: watch,
    readLast: readLast
  };
}

module.exports = Tail;
