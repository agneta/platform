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
var path = require('path');
var bodyParser = require('body-parser');
var stylus = require('stylus');
var StylusCompiler = require('../core/compiler/style');
var ScriptCompiler = require('../core/compiler/script');

module.exports = function(locals) {

  locals.app = express();
  var app = locals.app;
  var project = locals.project;

  require('./auth')(locals);
  var scriptCompiler = ScriptCompiler(locals);
  var stylusCompiler = StylusCompiler(locals);

  app.use(bodyParser.urlencoded({
    extended: false
  }));

  app.use(bodyParser.json());

  //////////////////////////////////////////////////////
  // SET PATHS
  //////////////////////////////////////////////////////

  var dirCache = path.join(project.paths.base, 'cache');

  //////////////////////////////////////////////////////
  //
  //////////////////////////////////////////////////////

  app.set('views', path.join(project.paths.base, 'layout'));
  app.set('view engine', 'ejs');
  app.set('json spaces', 2);

  //////////////////////////////////////////////////////
  // STYLUS
  //////////////////////////////////////////////////////

  var sources = [{
    name: 'project',
    path: project.paths.source
  },
  {
    name: 'theme',
    path: project.paths.sourceTheme
  }
  ];

  if (locals.includeSources) {
    sources = sources.concat(locals.includeSources);
  }

  for (var source of sources) {


    var cache = path.join(dirCache, source.name);
    // Styles
    app.use(stylus.middleware({
      src: source.path,
      dest: cache,
      compile: stylusCompiler
    }));

    // Scripts
    app.use(scriptCompiler.middleware);
    //
    app.use(express.static(source.path));
    //
    app.use(express.static(cache));
  }


  var libPath = path.join(project.paths.project, 'website', 'lib');
  app.use('/lib', express.static(libPath));

  //--------------------------------------------------
  //

  require('../core/get')(locals);
};
