'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var k8s = require('@kubernetes/client-node');
var fs = require('fs-extra');
module.exports = function () {
  var configFile = process.env['HOME'] + '/.kube/config';
  if (!fs.existsSync(configFile)) {
    return;
  }
  var kc = new k8s.KubeConfig();
  kc.loadFromFile(configFile);
  var k8sApi = new k8s.Core_v1Api(kc.getCurrentCluster()['server']);
  k8sApi.setDefaultAuthentication(kc);
  k8sApi.listNamespacedPod('default')
    .then(function (res) {
      console.log(res.body);
    });
};
//# sourceMappingURL=050-clusters.js.map