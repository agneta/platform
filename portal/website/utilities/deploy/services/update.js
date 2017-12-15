var AWS = require('aws-sdk');

module.exports = function(util) {

  var ecs = new AWS.ECS();
  var config = util.app.get('aws').ecs.staging.services;

  return ecs.describeClusters({
    clusters: [config.cluster]
  })
    .promise()
    .then(function(result) {
      var cluster = result.clusters[0];
      if (!cluster) {
        throw new Error(`Could not find cluster with name ${config.cluster}`);
      }

      util.log(`Cluster with arn: ${cluster.clusterArn} has status: ${cluster.status}`);

      return ecs.describeServices({
        services: [config.service],
        cluster: config.cluster
      })
        .promise();
    })
    .then(function(result) {
      var service = result.services[0];
      if (!service) {
        throw new Error(`Could not find service with name ${config.service}`);
      }

      util.log(`Service with arn: ${service.serviceArn} has status: ${service.status}`);
      util.log(`Service tasks: ${service.desiredCount} desired, ${service.runningCount} running, ${service.pendingCount} pending`);

      util.log(`Task definition using: ${service.taskDefinition}`);

      return ecs.describeTaskDefinition({
        taskDefinition: service.taskDefinition
      })
        .promise();
    })
    .then(function(result) {
      var taskDefinition = result.taskDefinition;

      console.log('taskDefinition',taskDefinition);
    });

};
