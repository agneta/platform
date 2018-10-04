module.exports = function(Model, app) {
  var directory = app.explorer.directory({
    model: Model,
    namespace: 'pages',
    pathProp: 'path',
    fields: {
      title: true,
      path: true
    }
  });

  Model.list = function(dir, marker, req) {
    var lang = app.getLng(req);
    return directory.list({
      dir: dir,
      limit: 20,
      where: {
        lang: lang
      },
      marker: marker
    });
  };

  Model.remoteMethod('list', {
    description: 'List the files',
    accepts: [
      {
        arg: 'dir',
        type: 'string',
        required: false
      },
      {
        arg: 'marker',
        type: 'number',
        required: false
      },
      {
        arg: 'req',
        type: 'object',
        http: {
          source: 'req'
        }
      }
    ],
    returns: {
      arg: 'result',
      type: 'object',
      root: true
    },
    http: {
      verb: 'post',
      path: '/list'
    }
  });
};
