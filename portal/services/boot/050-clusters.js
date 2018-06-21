'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var k8s = require('@kubernetes/client-node');
var fs = require('fs-extra');
module.exports = function(app) {
  var configFile = process.env.HOME + '/.kube/config';
  if (!fs.existsSync(configFile)) {
    return;
  }
  var kc = new k8s.KubeConfig();
  kc.loadFromFile(configFile);
  var k8sApiCore = new k8s.Core_v1Api(kc.getCurrentCluster().server);
  var k8sApiApps = new k8s.Apps_v1beta1Api(kc.getCurrentCluster().server);
  k8sApiCore.setDefaultAuthentication(kc);
  k8sApiApps.setDefaultAuthentication(kc);
  app.k8s = {
    config: kc,
    core: k8sApiCore,
    apps: k8sApiApps
  };
};
//# sourceMappingURL=050-clusters.js.map
