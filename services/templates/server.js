/*   Copyright 2017 Agneta Network Applications, LLC.
 *
 *   Source file: services/templates/server.js
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
const express = require('express');
const app = express();
const Email = require('../boot/02-email');

app.get('/:lang/:template', function(req, res, next)
{

  Email(app)
    .then(function(email)
    {

      var lang = req.params.lang;
      var template_name = req.params.template;
      var template = email.templates[template_name];

      template.render(
        {
          language: lang
        }, function(err, result)
        {

          if (err)
          {
            return next(err);
          }
          if (req.query.text)
          {

            var text = email.text(result.html);

            res.type('text/plain');
            res.send(text);
            return;
          }
          res.send(result.html);

        },
        function(err)
        {
          return next(err);
        });
    });

});

var port = 8181;
app.listen(port);

console.log('Listening on port: ' + port);
