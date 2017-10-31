const Tail = require('tail').Tail;
const path = require('path');
module.exports = function(Model, app) {

  var paths = app.get('options').paths;

  var tail = new Tail(
    path.join(
      paths.project
    ), {
      follow: true
    }
  );

  tail.on('line', function(data) {
    console.log(data);
  });


  Model.logs = function() {

    return Promise.resolve()
      .then(function() {

      });

  };

  Model.remoteMethod(
    'logs', {
      description: 'Get application logs',
      accepts: [],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/logs'
      }
    }
  );

};
