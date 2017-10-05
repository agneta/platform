const path = require('path');

module.exports = function(session, app) {

  session.on('rename', function(location, newLocation, callback) {

    location = session.helpers.location(location);
    newLocation = session.helpers.location(newLocation);
    newLocation = path.parse(newLocation);

    console.log('sftp:rename:location',location);
    console.log('sftp:rename:newLocation',newLocation);

    app.models.Media_Private.__updateFile({
      location: location,
      dir: newLocation.dir,
      name: newLocation.name
    })
      .then(function() {

        callback.ok();

      })
      .catch(function(err) {

        console.log(err);
        callback.fail();

      });

  });


};
