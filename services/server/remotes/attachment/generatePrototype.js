const Promise = require('bluebird');


module.exports = function(Model) {

  Model.__generatePrototype = function(options) {

    options = options || {};

    if (!options.model) {
      throw new Error('Must provide a model');
    }

    var model = options.model;
    var name = options.name || 'uploadFile';

    model.prototype[name] = function(req) {

      var self = this;

      return Promise.resolve()
        .then(function() {
          //console.log('about to prepare file', data);
          return Model.__saveFile({
            model: model,
            instance: self,
            prop: options.prop,
            file: req.file
          });
        })
        .then(function() {

          return {
            success: 'File is uploaded'
          };

        });

    };

  };
};
