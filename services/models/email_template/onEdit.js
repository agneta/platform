const chokidar = require('chokidar');
const path = require('path');

module.exports = function(Model) {

  var email = Model.__email;

  var watcher = chokidar.watch(email.templatePaths, {
    ignoreInitial: true,
    ignored: /[/\\]\./
  });


  watcher.on('change', function(pathFile) {

    var templateDir = path.parse(pathFile).dir;
    var name = path.parse(templateDir).name;

    if(name=='_layout'){
      return email.reloadAll()
        .then(function(){
          Model.io.emit('edit',{
            global: true
          });
        });
    }

    return email.compiler({
      pathTemplate: templateDir
    })
      .then(function(template){
        if(!template){
          return;
        }
        //console.log(`emit ${template.name}`);
        Model.io.emit('edit',{
          name: template.name
        });
      });

  });

};
