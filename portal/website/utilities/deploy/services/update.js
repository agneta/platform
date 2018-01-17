/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/website/utilities/deploy/services/update.js
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
const AWS = require('aws-sdk');
const _ = require('lodash');

module.exports = function(util, options) {

  var target = options.target;

  var ecs = new AWS.ECS();
  var ecr = new AWS.ECR();

  var config = util.app.get('aws');
  var configECS = config.ecs[target];

  var taskDefinition;

  return ecs.describeClusters({
    clusters: [configECS.cluster]
  })
    .promise()
    .then(function(result) {
      var cluster = result.clusters[0];
      if (!cluster) {
        throw new Error(`Could not find cluster with name ${configECS.cluster}`);
      }

      util.log(`Cluster with arn: ${cluster.clusterArn} has status: ${cluster.status}`);

      return ecs.describeServices({
        services: [configECS.service],
        cluster: configECS.cluster
      })
        .promise();
    })
    .then(function(result) {
      var service = result.services[0];
      if (!service) {
        throw new Error(`Could not find service with name ${configECS.service}`);
      }

      logService(service);

      return ecs.describeTaskDefinition({
        taskDefinition: service.taskDefinition
      })
        .promise();
    })
    .then(function(result) {
      taskDefinition = _.omit(result.taskDefinition, ['taskDefinitionArn', 'revision', 'status', 'requiresAttributes']);
      //console.log(taskDefinition);
      return ecr.listImages({
        repositoryName: config.codebuild.repository,
        filter:{
          tagStatus: 'TAGGED'
        }
      })
        .promise();
    })
    .then(function(result) {

      var image;
      for(var imageId of result.imageIds){
        if(imageId.imageTag=='latest'){
          image = imageId;
        }
      }

      if (!image) {
        throw new Error(`Could not find an image available in repository: ${config.codebuild.repository}`);
      }

      var container = taskDefinition.containerDefinitions[0];
      var imageName = container.image.split('@');
      if (imageName.length != 2) {
        imageName = container.image.split(':');
      }
      imageName = imageName[0];
      imageName += `@${image.imageDigest}`;

      util.log(`Creating a new task definition for image ${imageName}`);

      container.image = imageName;

      //console.log('image', image);
      //console.log('taskDefinition', taskDefinition);

      return ecs.registerTaskDefinition(taskDefinition)
        .promise();

    })
    .then(function(result) {

      return ecs.updateService({
        service: configECS.service,
        cluster: configECS.cluster,
        taskDefinition: result.taskDefinition.taskDefinitionArn
      })
        .promise();

    })
    .then(function(result) {
      util.log('Service is now updated!');
      logService(result.service);
    });

  function logService(service) {
    util.log(`Service with arn: ${service.serviceArn} has status: ${service.status}`);
    util.log(`Service tasks: ${service.desiredCount} desired, ${service.runningCount} running, ${service.pendingCount} pending`);
    util.log(`Task definition using: ${service.taskDefinition}`);
  }

};
