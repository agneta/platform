const _ = require('lodash');

module.exports = function(Model, app) {

  var mediaOptions = {
    name: 'editor',
    auth: {
      allow: ['editor']
    }
  };

  Model.io = app.socket.namespace(mediaOptions);

  var web = app.get('options').web;

  Model.contentChange = function(data, req) {

    if (!req.accessToken) {
      return Promise.reject({
        message:'Must be logged in'
      });
    }

    return Promise.resolve()
      .then(function() {

        var listener = `content-change:${data.path}:${data.id}`;

        data.actor = req.accessToken.userId;

        if (_.isString(data.value)) {
          data.value = web.app.locals.render(data.value);
        }

        Model.io.emit(listener, data);

      })
      .then(function() {
        return {
          message: 'notified socket cluster'
        };
      });


  };

  Model.remoteMethod(
    'contentChange', {
      description: 'Change content by given data',
      accepts: [{
        arg: 'data',
        type: 'object',
        required: true
      },{
        arg: 'req',
        type: 'object',
        'http': {
          source: 'req'
        }
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'get',
        path: '/content-change'
      }
    }
  );

};
