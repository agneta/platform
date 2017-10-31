const chokidar = require('chokidar');
const fs = require('fs-extra');
const os = require('os');

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
        return buffer.toString('utf8').split(os.EOL);
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
