module.exports = function(shared) {

  var app = shared.app;

  for(var name in app.dataRemote){
    var dataRemote = app.dataRemote[name];
    var model = app.models[dataRemote.modelName];
    model.loadTemplate = function(req){
      return app.edit.loadTemplate({
        path: dataRemote.path,
        req: req
      });
    };
  }

};
