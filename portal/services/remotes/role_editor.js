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

  Model.contentChange = function(data,req){

    var accessToken = req.accessToken;
    var listener = `content-change:${data.path}:${data.id}`;

    if(!accessToken){
      return;
    }

    data.actor = accessToken.userId;

    if(_.isString(data.value)){
      data.value = web.app.locals.render(data.value);
    }

    Model.io.emit(listener, data);

  };

  Model.remoteMethod(
    'contentChange', {
      description: 'Get All Keywords by language',
      accepts: [{
        arg: 'lang',
        type: 'string',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'array',
        root: true
      },
      http: {
        verb: 'get',
        path: '/content-change'
      }
    }
  );

};
