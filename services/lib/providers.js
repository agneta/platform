var AWS = require('aws-sdk');

module.exports = function(app) {
  let services = app.web.services;
  let secrets = services.secrets.get('aws');

  if (!secrets) {
    return;
  }

  AWS.config.update({
    accessKeyId: secrets.id,
    secretAccessKey: secrets.secret,
    region: secrets.region
  });

  app.aws = {
    ecs: new AWS.ECS(),
    ecr: new AWS.ECR(),
    ses: new AWS.SES(),
    s3: new AWS.S3()
  };
};
