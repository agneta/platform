const fs = require('fs-extra');

module.exports = function(session) {

  session.on('stat', function(path, statkind, res) {

    res.is_directory();
    res.is_file();

    res.permissions = 0o755;
    //res.uid = 1;
    //res.gid = 1;
    res.size = 0;
    res.atime = 123456;
    res.mtime = 123456;

    res.file();
    res.nofile();
  });

  //------------------------------------------------------------------------------------
  // Send file from Storage

  session.on('readfile', function(path, writable_stream) {


  });

  //------------------------------------------------------------------------------------
  // Upload file from Storage

  session.on('writefile', function(path, readable_stream) {

  });

  //------------------------------------------------------------------------------------
  // Delete file from Storage

  session.on('delete', function(path, callback) {

    callback.ok();
    callback.fail();

  });

  //------------------------------------------------------------------------------------

  session.on('rename', function(oldPath, newPath, callback) {

    callback.ok();
    callback.fail();

  });
  //------------------------------------------------------------------------------------

  session.on('mkdir', function(path, callback) {

    callback.ok();
    callback.fail();

  });

  //------------------------------------------------------------------------------------

  session.on('rmdir', function(path, callback) {

    callback.ok();
    callback.fail();

  });

  //------------------------------------------------------------------------------------

  session.on('readdir', function(path, res) {

    var dirs = [];
    var i = 0;

    res.on('dir', function() {
      if (dirs[i]) {

        var mode;
        // is dir
        mode = fs.constants.S_IFDIR;
        // is file
        mode = fs.constants.S_IFREG;

        var attrs = {
          'mode': mode | 0o644,
          'permissions': 0o644,
          'uid': 1,
          'gid': 1,
          'size': 1234,
          'atime': 123456,
          'mtime': 123456
        };

        res.file(attrs);
        return i++;
      } else {
        return res.end();
      }
    });

    return res.on('end', function() {
      return console.warn('Now I would normally do, like, cleanup stuff, for this directory listing');
    });

  });


};
