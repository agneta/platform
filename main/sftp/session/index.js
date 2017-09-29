const path = require('path');

module.exports = function(session, app) {

  require('./readdir')(session, app);

  session.on('stat', function(path, statkind, res) {

    console.log('stat');
    app.models.Media_Private.details(null, path)
      .then(function(item) {
        console.log(item);
      })
      .catch(console.error);
    //res.is_directory();
    res.is_file();

    res.permissions = 0o755;
    res.uid = 1;
    res.gid = 1;
    res.size = 1234;
    res.atime = 123456;
    res.mtime = 123456;

    res.file();
    //res.nofile();
  });

  //------------------------------------------------------------------------------------

  session.on('realpath', function(location, callback) {
    callback(
      path.join('/', location)
    );
  });


  //------------------------------------------------------------------------------------
  // Send file from Storage

  session.on('readfile', function(location, writable_stream) {
    var req = {
      accessToken: {
        // For testing only
        userId: '58579794ccc7d91100d86bd3'
      }
    };

    var parsed = path.parse(location);
    parsed.ext = null;
    parsed.base = null;
    location = path.format(parsed);

    app.models.Media_Private.__download(location, req)
      .then(function(item) {
        item.stream.pipe(writable_stream);
      })
      .catch(function(error) {
        console.error(error);
      });
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


};
