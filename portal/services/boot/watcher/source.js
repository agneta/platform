/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/boot/watcher/source.js
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
const Promise = require('bluebird');
module.exports = function(watcher) {

  var locals = watcher.locals;
  var project = watcher.project;

  return function(pathFile) {
    var params = path.parse(pathFile);
    var filter = null;
    var type = null;
    return Promise.resolve()
      .then(function() {

        switch (params.ext) {

          case '.yml':
            type='page';
            return locals.main.load.pages();
          case '.styl':
            type='style';
            filter = '.css';
            break;
          case '.js':
            type='script';
            break;
          case '.ejs':
            type='template';
            locals.cache.templates.invalidate(pathFile);
            break;
        }

      })
      .then(function() {
        var page = null;
        var pathSource = project.theme.getSourcePath(pathFile);
        if(!pathSource){
          return;
        }
        var pathParams = path.parse(pathSource);
        var pathPage = path.join(
          pathParams.dir,
          pathParams.name+'.yml'
        );

        var pathSourceAbs = project.theme.getSourceFile(pathPage);
        //console.log('pathSourceAbs',pathSourceAbs);
        if(!pathSourceAbs){
          pathPage = path.join(pathParams.dir+'.yml');
          pathSourceAbs = project.theme.getSourceFile(pathPage);
        }

        if(pathSourceAbs){
          pathSource = project.theme.getSourcePath(pathSourceAbs);

          page = project.site.pages.findOne({
            source: pathSource
          });
        }

        var emitOptions = {
          type: type,
          filter: filter
        };

        if(page){
          emitOptions.path = page.path;
        }else{
          emitOptions.global = true;
        }
        //console.log('emitOptions',emitOptions);
        //app.portal.socket.emit('page-reload',emitOptions);
      });
  };
};
