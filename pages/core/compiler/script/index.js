/*   Copyright 2017 Agneta Network Applications, LLC.
*
*   Source file: pages/core/compiler/script.js
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
const util = require('util');
const Compiler = require('./compiler');
module.exports = function(locals) {
  var compiler = Compiler(locals);

  function middleware(req, res, next) {
    var parsedPath = path.parse(req.path);

    switch (parsedPath.ext) {
      case '.js':
        if (path.parse(parsedPath.name).ext == '.min') {
          return next();
        }

        compiler
          .run(req.path)
          .then(function() {
            next();
          })
          .catch(function(err) {
            if (err.notfound || err.skip) {
              return next();
            }
            res.setHeader('content-type', 'application/json');
            res.end(util.inspect(err));
          });

        return;
    }
    next();
  }

  return {
    init: compiler.init,
    middleware: middleware,
    compile: compiler.run
  };
};
