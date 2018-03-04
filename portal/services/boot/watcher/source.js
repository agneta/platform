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
  var app = watcher.app;

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
            filter = `/${params.name}.css`;
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
        var pathSearch = '/source/';
        var pathPage = path.join(
          params.dir,
          params.name
        );
        pathPage = pathPage.substring(
          pathPage.indexOf(pathSearch)+pathSearch.length-1
        );
        var page = project.site.pages.findOne({
          path: pathPage
        });

        if(!page){
          return;
        }

        app.portal.socket.emit('page-reload',{
          path: page.path,
          type: type,
          filter: filter
        });
      });
  };
};
