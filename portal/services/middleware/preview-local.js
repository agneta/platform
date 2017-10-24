const path = require('path');
const express = require('express');

module.exports = function(app) {

  var projectPaths = app.get('options').web.project.paths;

  return function(req, res, next) {

    var parsed = path.parse(req.path);

    if (!parsed.ext) {
      res.set('content-encoding', 'gzip');
    }

    express.static(path.join(projectPaths.build, 'local'))(
      req,
      res,
      next);
  };

};
