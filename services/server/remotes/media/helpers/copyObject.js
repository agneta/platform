const urljoin = require('url-join');
const Promise = require('bluebird');

module.exports = function(Model, app) {

  Model.__copyObject = function(operation) {

    return app.storage.copyObject({
      Bucket: Model.__bucket.name,
      CopySource: urljoin(Model.__bucket.name, operation.source),
      Key: operation.target,
      ContentType: operation.contentType
    })
      .catch(function(err) {
        if (err.message.indexOf('This copy request is illegal because it is trying to copy an object to itself') === 0) {
          return;
        }
        if (err.message.indexOf('The specified key does not exist') === 0) {
          return;
        }
        console.error(operation);
        return Promise.reject(err);
      });
  };

};
