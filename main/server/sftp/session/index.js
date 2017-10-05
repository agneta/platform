const path = require('path');

module.exports = function(session, app) {

  require('./helpers')(session, app);
  require('./rename')(session, app);
  require('./delete')(session, app);
  require('./readdir')(session, app);
  require('./mkdir')(session, app);
  require('./writefile')(session, app);
  require('./readfile')(session, app);

  session.on('stat', function(location, statkind, res) {

    location = session.helpers.location(location);

    app.models.Media_Private.details(null, location)
      .then(function(item) {
        console.log(item);

        switch(item.type){
          case 'folder':
            res.is_directory();
            break;
          default:
            res.is_file();
            break;
        }

        res.permissions = 0o755;
        res.uid = 'user';
        res.gid = 'group';
        res.size =item.sizeBytes;
        res.atime = item.createdAt;
        res.mtime = item.updatedAt;

        res.file();

      })
      .catch(console.error);

    //res.nofile();
  });

  //------------------------------------------------------------------------------------

  session.on('realpath', function(location, callback) {
    callback(
      path.join('/', location)
    );
  });

};
