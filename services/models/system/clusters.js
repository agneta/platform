const k8s = require('@kubernetes/client-node');

module.exports = function(Model) {

  let k8sApi = k8s.Config.defaultClient();

  Model.clusters = function() {

    return k8sApi.listNamespacedPod('default')
      .then(function(res) {
        console.log(res.body);
        return res;
      });

  };

  Model.remoteMethod(
    'clusters', {
      description: 'Get project clusters',
      accepts: [],
      returns: {
        arg: 'result',
        type: 'object',
        root: true
      },
      http: {
        verb: 'post',
        path: '/clusters'
      }
    }
  );

};
