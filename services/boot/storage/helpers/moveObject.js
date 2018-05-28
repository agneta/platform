const urljoin = require('url-join');

module.exports = function(app) {

  app.storage.moveObject = function(options) {

    return app.storage.copyObject({
      Bucket: options.Bucket,
      CopySource: urljoin(options.Bucket, options.From),
      Key: options.To
    })
      .then(function(){

        return app.storage.deleteObject({
          Bucket: options.Bucket,
          Key: options.From
        });

      });
  };
};
