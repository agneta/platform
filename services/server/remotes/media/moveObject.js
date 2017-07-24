module.exports = function(Model) {

  Model.moveObject = function(source, target) {
    return Model.__moveObject({
      source: source,
      target: target
    })
      .then(function() {
        return {
          message: `Moved successfully from ${source} to ${target}`
        };
      });
  };

  Model.remoteMethod(
    'moveObject', {
      description: 'Move an object',
      accepts: [{
        arg: 'source',
        type: 'string',
        required: true
      },{
        arg: 'target',
        type: 'string',
        required: true
      }],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/move-object'
      }
    });

};
