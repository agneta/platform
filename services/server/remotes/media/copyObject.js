module.exports = function(Model) {

  Model.copyObject = function(source, target) {
    return Model.__copyObject({
      source: source,
      target: target
    })
      .then(function() {
        return {
          message: `Copied successfully from ${source} to ${target}`
        };
      });
  };

  Model.remoteMethod(
    'copyObject', {
      description: 'Copy an object',
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
        path: '/copy-object'
      }
    });

};
