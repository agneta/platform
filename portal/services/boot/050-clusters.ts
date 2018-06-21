import k8s = require('@kubernetes/client-node');
const fs = require('fs-extra');

module.exports = function(app: any) {
  const configFile = process.env.HOME + '/.kube/config';

  if (!fs.existsSync(configFile)) {
    return;
  }

  const kc = new k8s.KubeConfig();
  kc.loadFromFile(configFile);

  const k8sApiCore = new k8s.Core_v1Api(kc.getCurrentCluster().server);
  const k8sApiApps = new k8s.Apps_v1beta1Api(kc.getCurrentCluster().server);
  k8sApiCore.setDefaultAuthentication(kc);
  k8sApiApps.setDefaultAuthentication(kc);

  app.k8s = {
    config: kc,
    core: k8sApiCore,
    apps: k8sApiApps
  };
};
