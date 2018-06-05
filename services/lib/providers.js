var AWS = require('aws-sdk');

module.exports = function(app){

  let config = app.secrets.get('aws');
  if(config){
    AWS.config.update({
      accessKeyId: config.id,
      secretAccessKey: config.secret,
      region: config.region
    });
  }

};
