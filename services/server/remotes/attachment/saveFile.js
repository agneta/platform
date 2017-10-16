const Promise = require('bluebird');
const fs = require('fs-extra');

module.exports = function(Model, app) {


  Model.__saveFile = function(options) {

    console.log(options);
    var props;
    var relation = options.instance[options.prop];

    return fs.readFile(options.file.path)
      .then(function(content) {

        props = {
          name: options.file.originalname,
          size: options.file.size,
          downloadDisabled: true,
          data: app.secrets.encrypt(content)
        };

        return fs.remove(options.file.path);

      })
      .then(function() {

        return Promise.promisify(relation)();
      })
      .then(function(attachment) {
        console.log('attachment', attachment);
        if (!attachment) {
          return relation.create(props);
        }

        return relation.update(props);
      });

  };

};
