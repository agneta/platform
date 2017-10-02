const path = require('path');

module.exports = function(session,app) {

  session.helpers = {
    location: function(location) {

      var parsed = path.parse(location);

      location = path.join(parsed.dir, parsed.name);
      location = path.normalize(location);
      location = app.helpers.normalizePath(location);

      return location;
    }
  };

};
