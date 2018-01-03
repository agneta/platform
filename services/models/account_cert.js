
module.exports = function(Model, app) {

  app.attachment.generatePrototype({
    model: Model,
    name: 'uploadPfx',
    prop: 'pfxFile',
  });

};
