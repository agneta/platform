const path = require('path');
module.exports = function(Model,app) {

  var dataDirs = [];
  var webPaths = app.web.project.paths;

  for(var name in webPaths.app.extensions){
    var extPaths = webPaths.app.extensions[name];
    dataDirs.push(
      path.join(extPaths.base,'edit',Model.editConfigDir)
    );
  }

  dataDirs.push(
    path.join(webPaths.app.base,'edit',Model.editConfigDir)
  );

  Model.__dataDirs = dataDirs;

  require('./display')(Model, app);
  require('./getTemplatePath')(Model, app);
  require('./loadTemplate')(Model, app);
  require('./loadTemplates')(Model, app);

};
