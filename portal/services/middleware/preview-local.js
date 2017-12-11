/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: portal/services/middleware/preview-local.js
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
const express = require('express');

module.exports = function(app) {

  var projectPaths = app.get('options').web.project.paths;

  return function(req, res, next) {

    app.auth.middleware({
      req: req,
      res: res,
      next: next,
      allow: ['administrator', 'editor'],
      route: function() {
        var parsed = path.parse(req.path);

        if (!parsed.ext) {
          res.set('content-encoding', 'gzip');
        }

        express.static(path.join(projectPaths.app.build, 'local'))(
          req,
          res,
          next);
      }
    });


  };

};
