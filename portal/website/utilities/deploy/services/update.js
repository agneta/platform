var AWS = require('aws-sdk');

module.exports = function(util){

  var ecs = new AWS.ECS();
  var config = util.app.get('aws');
  var clusterName = config.cluster.live.staging;

  return ecs.describeClusters({
    clusters: [clusterName]
  })
    .promise()
    .then(function(result){
      var cluster = result.clusters[0];
      if(!cluster){
        throw new Error(`Could not find cluster with name ${clusterName}`);
      }
    });

};
