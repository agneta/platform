const db = require('mime-db');
const mime = require('mime-type')(db);
const path = require('path');

//------------------------------------------------------------------------------------
// Upload file from Storage

module.exports = function(session, app) {

  session.on('writefile', function(location, readable_stream) {

    var parsed = path.parse(location);

    var contentType = mime.lookup(
      parsed.ext
    );

    var type = app.helpers.mediaType(contentType);
    location = session.helpers.location(location);

    //console.log('writefile:location',location);
    //console.log('writefile:type',type);
    //console.log('writefile:contentType',contentType);

    app.models.Media_Private.__sendFile({
      location: location,
      type: type,
      mimetype: contentType,
      stream: readable_stream
    })
      .then(function() {

      })
      .catch(function(error) {
        console.error(error);
      });
  });

};
