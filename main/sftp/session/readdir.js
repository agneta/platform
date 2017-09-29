const fs = require('fs-extra');
const _ = require('lodash');

module.exports = function(session, app) {

  session.on('readdir', function(path, res) {

    var marker = null;
    var i = 0;
    var loaded = [];

    console.log('readdir', path);

    res.on('dir', function() {

      Promise.resolve()
        .then(function() {

          if(loaded.length>i){
            return sendItem();
          }

          if (
            loaded.length == i &&
            (marker || _.isNull(marker))
          ) {

            return app.models.Media_Private._list(null, 50, marker)
              .then(function(result) {

                loaded = loaded.concat(result.objects);
                marker = result.nextMarker;
                //console.log(result);
                sendItem();
              });

          }

          res.end();

        })
        .catch(console.error);

      function sendItem() {

        var item = loaded[i];
        var mode;

        switch(item.type){
          case 'folder':
            mode = fs.constants.S_IFDIR;
            break;
          default:
            mode = fs.constants.S_IFREG;
            break;
        }


        var attrs = {
          mode: mode | 0o644,
          uid: 1000,
          gid: 1000,
          size: item.sizeBytes,
          atime: item.createdAt,
          mtime: item.updatedAt
        };

        var filename = item.name;

        if(item.ext){
          filename += '.' + item.ext;
        }
        console.dir(attrs);
        res.file(filename);
        return i++;
      }


    });

    res.on('end', function() {
      return console.warn('Now I would normally do, like, cleanup stuff, for this directory listing');
    });

  });

};
