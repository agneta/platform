/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/models/email_template/onEdit.js
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */
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
