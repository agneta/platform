/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/process/clusters.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
import k8s = require('@kubernetes/client-node');

interface AgnetaServices {
  models: any;
  k8s: {
    config: k8s.KubeConfig;
    core: k8s.Core_v1Api;
    apps: k8s.Apps_v1beta1Api;
  };
}

module.exports = function(Model: any, app: AgnetaServices) {
  Model.clusters = function() {
    return app.models.Process_Server.find({
      include: 'processes'
    }).then(function(result: any) {
      console.log(result);
      return {
        list: app.k8s.config.getClusters()
      };
    });
  };

  Model.remoteMethod('clusters', {
    description: 'Get clusters',
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
  });
};
