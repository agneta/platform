import k8s = require('@kubernetes/client-node');
const fs = require('fs-extra');

module.exports = function() {

  let configFile = process.env['HOME'] + '/.kube/config';

  if(!fs.existsSync(configFile)){
    return;
  }

  let kc = new k8s.KubeConfig();
  kc.loadFromFile(configFile);

  let k8sApi = new k8s.Core_v1Api(kc.getCurrentCluster()['server']);
  k8sApi.setDefaultAuthentication(kc);
  k8sApi.listNamespacedPod('default')
    .then(function(res) {
      console.log(res.body);
    });

};
