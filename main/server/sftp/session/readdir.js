const fs = require('fs-extra');
const _ = require('lodash');

module.exports = function(session, app) {

  session.on('readdir', function(location, res) {

    var marker = null;
    var i = 0;
    var loaded = [];

    location = session.helpers.location(location);
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

            console.log(location,marker);

            return app.models.Media_Private._list(location, 50, marker)
              .then(function(result) {

                console.log('sftp:readdir:list:result',result);

                loaded = loaded.concat(result.objects);
                marker = result.nextMarker;

                if(result.objects.length){
                  sendItem();
                }else{
                  res.end();
                }
              });

          }

          res.end();

        })
        .catch(console.error);

      function sendItem() {

        var item = loaded[i];
        var mode, permissions;

        switch(item.type){
          case 'folder':
            mode = fs.constants.S_IFDIR;
            permissions = 'drwxrwxr-x';
            break;
          default:
            mode = fs.constants.S_IFREG;
            permissions = '-rw-rw-r--';
            break;
        }

        var attrs = {
          mode: mode | 0o644,
          permissions: permissions,
          uid: 'user',
          gid: 'group',
          size: item.sizeBytes,
          atime: item.createdAt,
          mtime: item.updatedAt
        };

        var filename = item.name;

        if(item.ext){
          filename += '.' + item.ext;
        }
        res.file(filename,attrs);
        return i++;
      }


    });

    res.on('end', function() {
      //return console.warn('Now I would normally do, like, cleanup stuff, for this directory listing');
    });

  });

};
