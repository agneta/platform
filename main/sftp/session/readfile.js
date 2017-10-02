
module.exports = function(session, app) {

  session.on('readfile', function(location, writable_stream) {
    var req = {
      accessToken: {
      // For testing only
        userId: '58579794ccc7d91100d86bd3'
      }
    };

    location = session.helpers.location(location);

    app.models.Media_Private.__download(location, req)
      .then(function(item) {
        item.stream.pipe(writable_stream);
      })
      .catch(function(error) {
        console.error(error);
      });
  });


};
