const chokidar = require('chokidar');
const fs = require('fs-extra');
const os = require('os');
const Promise = require('bluebird');
const EventEmitter = require('events').EventEmitter;

function Tail(filename, options) {

  options = Object.assign(options || {}, {
    alwaysStat: true,
    ignoreInitial: false,
    persistent: true,
  });

  var watcher;
  var fd;
  var events = new EventEmitter();

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

    if (watcher) {
      console.warn('already watching');
      return;
    }

    var lastSize = fs.statSync(filename).size;
    var pending = false;
    watcher = chokidar.watch(filename, options)
      .on('change', function(path) {

        if (pending) {
          return;
        }

        pending = true;
        var stats;

        return Promise.resolve()
          .then(function() {
            return Promise.delay(400);
          })
          .then(function() {

            stats = fs.statSync(filename);
            var diff = stats.size - lastSize;
            if (diff > 0) {

              return onChange(path, diff, lastSize)
                .then(function(result) {
                  events.emit('change', result);
                });

            }

          })
          .then(function() {
            return Promise.delay(300);
          })
          .then(function() {
            lastSize = stats.size;
            pending = false;
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
        var entries = buffer.toString('utf8');
        entries = entries.split('>> ');
        entries.shift(1);

        var entriesFinal = [];
        var lastEntry = {};

        return Promise.map(entries, function(entry) {
            entry = entry.split(' :: ');
            var date = entry[0];
            var message = entry[1];
            var lines = message.split(os.EOL);
            var linesFinal = [];
            return Promise.map(lines, function(line) {
                if (!line || !line.length) {
                  return;
                }
                linesFinal.push(line);
              })
              .then(function() {

                if (lastEntry.date != date) {

                  lastEntry = {
                    date: date,
                    lines: linesFinal
                  };

                  entriesFinal.push(lastEntry);

                } else {
                  lastEntry.lines = lastEntry.lines.concat(linesFinal);
                }
              });

          })
          .then(function() {
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
    events: events,
    close: close,
    watch: watch,
    readLast: readLast
  };
}

Tail.prototype.__proto__ = EventEmitter.prototype;

module.exports = Tail;
