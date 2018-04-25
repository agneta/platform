/*   Copyright 2017 Agneta Network Applications, LLC.
*
*   Source file: portal/services/boot/04-watcher.js
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
const Promise = require('bluebird');
const _ = require('lodash');
const path = require('path');

module.exports = function(app) {

  var locals = app.client;
  var webLocals = app.web;

  init(locals);
  init(webLocals);

  function reload() {
    //console.log('reload');
    app.portal.socket.emit('page-reload');
  }

  //----------------------------------------------------------

  function init(locals) {
    var project = webLocals.project;

    var options = {
      project: project,
      locals: locals,
      reload: reload,
      app: app
    };

    //----------------------------------------------------------

    var servicePaths = locals.services.get('services_include');
    var websitePaths = locals.project.theme.dirs;

    watch({
      dirs: _.map(websitePaths,function(dir){
        return path.join(dir,'config.yml');
      }),
      onFile: require('./watcher/config')(options)
    });
    watch({
      dirs: _.map(websitePaths,function(dir){
        return path.join(dir,'data');
      }),
      onFile: require('./watcher/data')(options)
    });
    watch({
      dirs: _.map(servicePaths,function(dir){
        return path.join(dir,'models');
      }),
      onFile: require('./watcher/models')(options)
    });
    watch({
      dirs: _.map(websitePaths,function(dir){
        return path.join(dir,'scripts');
      }),
      onFile: require('./watcher/scripts')(options)
    });
    watch({
      dirs: _.map(websitePaths,function(dir){
        return path.join(dir,'source');
      }),
      onFile: require('./watcher/source')(options)
    });

    //----------------------------------------------------------


    function watch(watchOptions) {

      var watcher = chokidar.watch(watchOptions.dirs, {
        ignoreInitial: true,
        ignored: /[/\\]\./
      });

      watcher.on('add', function(pathFile) {
        onWatcher(pathFile);
      });

      watcher.on('change', function(pathFile) {
        onWatcher(pathFile);
      });

      watcher.on('unlink', function(pathFile) {
        onWatcher(pathFile);
      });

      var updating = false;
      var queued = null;

      function onWatcher(pathFile) {

        if (updating) {
          queued = pathFile;
          return;
        }

        queued = null;
        updating = true;

        return Promise.resolve()
          .then(function() {
            return watchOptions.onFile(pathFile);
          })
          .then(function() {
            return Promise.delay(1000);
          })
          .then(function() {
            updating = false;
            if (queued) {
              return onWatcher(queued);
            }
          });
      }
    }
  }

};
