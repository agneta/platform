var express = require('express');
var path = require('path');
var yaml = require('js-yaml');
var _ = require('lodash');
var app = express();

var Email = require('../server/boot/02-email');

app.get('/:lang/:template', function(req, res, next) {

    Email(app)
        .then(function(email) {

            var lang = req.params.lang;
            var template_name = req.params.template;
            var template = email.templates[template_name];

            template.render({
                    language: lang
                }, function(err, result) {

                    if (err) {
                        return next(err);
                    }
                    if(req.query.text){

                      var text = email.text(result.html);

                     res.type('text/plain');
                      res.send(text);
                      return;
                    }
                    res.send(result.html);

                },
                function(err) {
                    return next(err);
                });
        });

});

var port = 8181;
app.listen(port);

console.log("Listening on port: " + port);
