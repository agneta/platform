var chokidar = require('chokidar');


module.exports = function(Model, app) {

  var email = app.get('email');

  var watcher = chokidar.watch(email.templatePaths, {
    ignoreInitial: true,
    ignored: /[/\\]\./
  });


  watcher.on('change', function(pathFile) {
    console.log(pathFile,email.templates,pathFile);
  });

};
