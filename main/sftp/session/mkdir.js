module.exports = function(session, app) {


  session.on('mkdir', function(location, callback) {

    location = session.helpers.location(location);

    app.models.Media_Private.newFolder(location)
      .then(function() {

        callback.ok();

      })
      .catch(function(err) {

        console.log(err);
        callback.fail();

      });


  });

};
