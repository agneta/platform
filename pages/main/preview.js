/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: pages/main/preview.js
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
var express = require('express');
var bodyParser = require('body-parser');

module.exports = function(locals) {

  locals.app = express();
  var app = locals.app;
  var project = locals.project;

  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(bodyParser.json());

  var sources = [{
    name: 'project',
    path: project.paths.app.source
  },
  {
    name: 'theme',
    path: project.paths.theme.source
  }
  ];

  if (locals.includeSources) {
    sources = sources.concat(locals.includeSources);
  }

  app.use(project.compiler.script.middleware);
  app.use(project.compiler.style.middleware);

  app.use(express.static(project.paths.app.cache));

  for (let source of sources) {
    app.use(express.static(source.path));
  }

  //--------------------------------------------------
  // middleware for rendering pages

  require('../core/get')(locals);

  //--------------------------------------------------
  // Return not found page

  app.use(function(req,res,next){

    Promise.resolve()
      .then(function() {
        return locals.app.renderPage('error/not-found', project.config.language.default.key);
      })
      .then(function(content) {

        if (!content) {
          return next();
        }

        res.status(404);
        res.send(content);

      })
      .catch(next);
  });

};
