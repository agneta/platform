const db = require('mime-db');
const mime = require('mime-type')(db);
const fs = require('fs-extra');
const path = require('path');

module.exports = function(Model,app) {

  Model.__uploadLocalFile = function(options) {

    var sourceParsed = path.parse(options.source);
    var contentType = mime.lookup(options.ext || sourceParsed.ext);
    var type = app.helpers.mediaType(contentType);
    var readStream = fs.createReadStream(options.source);

    return Model.__sendFile({
      location: options.location,
      type: type,
      mimetype: contentType,
      stream: readStream
    });

  };
};
