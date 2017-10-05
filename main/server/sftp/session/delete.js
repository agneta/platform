module.exports = function(session, app) {

  session.on('delete', remove);

  session.on('rmdir', remove);

  function remove(location, callback) {

    location = session.helpers.location(location);

    app.models.Media_Private.deleteObject(location)
      .then(function() {
        //console.log('sftp:session:delete', 'success');
        callback.ok();
      })
      .catch(function(err) {
        console.log(err);
        callback.fail();
      });


  }

};
