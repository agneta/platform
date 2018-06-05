module.exports = function(app) {

  var projectServices = app.web.services;

  app.models().forEach(function(model) {

    model.projectModel = function(name) {
      return projectServices.$model.get({
        name: name,
        isProduction: model.__isProduction
      });
    };

  });

};
