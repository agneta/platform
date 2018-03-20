/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/boot/email/helpers.js
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
const path = require('path');
const ejs = require('ejs');
const _ = require('lodash');
const fs = require('fs-extra');


module.exports = function(options){

  var templatePaths = options.templatePaths;
  var app = options.app;
  var clientHelpers = options.app.client.app.locals;

  var helpers = _.extend({},clientHelpers,{
    template: function(path_partial, data) {

      var file_path = helpers.getPath(path_partial + '.ejs');
      var file_content = fs.readFileSync(file_path, 'utf8');

      data = _.extend({}, this, data);

      return ejs.render.apply(this, [file_content, data]);
    },
    lng: function(obj) {
      var options;
      if(!obj){
        return;
      }
      if(obj.source){
        options = obj;
      }else{
        options = {
          source: obj,
          lang: this.language,
          templateData: this
        };
      }
      return app.lng(options);
    },
    getPath: function(path_partial){

      for(let templatePath of templatePaths){
        var file_path = path.join(templatePath, path_partial);
        if(fs.pathExistsSync(file_path)){
          return file_path;
        }
      }

      console.warn(`Could not find path for: ${path_partial}`);

    }
  });

  return helpers;
};
