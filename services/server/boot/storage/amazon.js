var AWS = require('aws-sdk');

module.exports = function(app, config) {

  config = config.s3;

  if (!config) {
    return;
  }

  AWS.config.update({
    accessKeyId: config.id,
    secretAccessKey: config.secret,
    region: config.region
  });

  var s3 = new AWS.S3();

  return {
    listObjects: function() {
      return s3.listObjects.apply(s3, arguments)
        .promise();
    },
    headObject: function() {
      return s3.headObject.apply(s3, arguments)
        .promise();
    },
    copyObject: function() {
      return s3.copyObject.apply(s3, arguments)
        .promise();
    },
    deleteObjects: function() {
      return s3.deleteObjects.apply(s3, arguments)
        .promise();
    },
    deleteObject: function() {
      return s3.deleteObject.apply(s3, arguments)
        .promise();
    },
    getObjectStream: function() {
      return s3.getObject.apply(s3, arguments)
        .createReadStream();
    },
    upload: function(options) {
      var upload = s3.upload.apply(s3, arguments);
      upload.on('httpUploadProgress', options.onProgress);
      return upload.promise();
    },

  };
};
