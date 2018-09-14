'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var k8s = require('@kubernetes/client-node');
var fs = require('fs-extra');
var yaml = require('js-yaml');
var _ = require('lodash');
var path = require('path');
module.exports = function(yargs) {
  yargs.command('cluster', 'Check your clusters', function(yargsCluster) {
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
    k8sApiApps
      .createNamespacedStatefulSet('default', loadState('mongodb'))
      .then(function(value) {
        console.log(value);
        return;
      })
      .catch(function(err) {
        console.error(err);
      });
    function loadState(name) {
      var state = new k8s.V1beta2StatefulSet();
      var file = path.join(__dirname, 'stateful-set', name + '.yml');
      var data = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
      _.extend(state, data);
      return state;
    }
    return;
  });
};
//# sourceMappingURL=index.js.map
