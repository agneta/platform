const fs = require('fs-extra');

module.exports = function(session, app) {

  session.on('readdir', function(path, res) {

    console.log('readdir', path);
    var dirs = [3, 3, 33, 3];
    var i = 0;

    res.on('dir', function() {
      if (dirs[i]) {

        var mode;
        // is dir
        mode = fs.constants.S_IFDIR;
        // is file
        mode = fs.constants.S_IFREG;

        var attrs = {
          mode: mode | 0o644,
          permissions: 0o644,
          uid: 1,
          gid: 1,
          size: 1234,
          atime: 123456,
          mtime: 123456
        };

        res.file('name', attrs);
        return i++;
      } else {
        res.end();
      }
    });

    res.on('end', function() {
      return console.warn('Now I would normally do, like, cleanup stuff, for this directory listing');
    });

  });

};
