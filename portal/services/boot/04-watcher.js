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
var chokidar = require('chokidar');
var Promise = require('bluebird');
const path = require('path');

module.exports = function(app) {

  var options = app.get('options');
  var locals = options.client;
  var webLocals = options.web;

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


    watch({
      dirs: [
        project.paths.app.config,
        project.paths.theme.config,
      ],
      onFile: require('./watcher/config')(options)
    });
    watch({
      dirs: [
        project.paths.app.data,
        project.paths.theme.data
      ],
      onFile: require('./watcher/data')(options)
    });
    watch({
      dirs: [
        path.join(project.paths.portal.services, 'models'),
        path.join(project.paths.core.services, 'models'),
        path.join(project.paths.app.models),
        path.join(project.paths.appPortal.models)
      ],
      onFile: require('./watcher/models')(options)
    });
    watch({
      dirs: [
        project.paths.theme.scripts,
        project.paths.pages.scripts,
        project.paths.app.scripts
      ],
      onFile: require('./watcher/scripts')(options)
    });
    watch({
      dirs: [
        project.paths.app.source,
        project.paths.theme.source
      ],
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
