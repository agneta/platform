module.exports = function(Model) {

  Model.copyObject = function(source, target) {
    return Model.__updateFile({
      location: source,
      target: target,
      copy: true
    })
      .then(function() {
        return {
          success: `Copied successfully from ${source} to ${target}`
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
      }, {
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
