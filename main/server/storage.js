const path = require('path');
const fs = require('fs-extra');
const mime = require('mime-types');
const send = require('send');
const express = require('express');
const getPort = require('get-port');


module.exports = function(options) {
  var locals = {
    app: express()
  };
  locals.app.set('name','local storage');

  function defaultHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  }

  return {
    locals: locals,
    init: function() {

      return Promise.resolve()
        .then(function() {

          var storageConfig = locals.services.app.get('storage');

          if(storageConfig.provider != 'local'){
            return;
          }

          console.log('using local storage');

          var base = storageConfig.buckets.media.host;
          var webPrj = locals.services.app.get('options').client.project;
          var root = path.join(webPrj.paths.core.storage);

          locals.app.use(`/${base}.ag`,function(req,res, next){

            var localPath = path.join(root,base,req.path);
            var localFile = `${localPath}.file`;
            //console.log('!!!!',localPath,localFile);
            fs.pathExists(localFile)
              .then(function(exists) {
                if(!exists){
                  defaultHeaders(res);
                  res.status(404)
                    .send('Not found');
                  return;
                }
                return fs.readJSON(localPath+'.json')
                  .then(function(meta) {

                    var ext = mime.extension(meta.ContentType);
                    var filename = path.parse(localFile).name + '.' + ext;

                    function headers (res) {
                      res.setHeader('Content-Disposition', `filename="${filename}"`);
                      res.setHeader('Content-Type',meta.ContentType);
                      defaultHeaders(res);
                    }

                    send(req,localFile,{
                      maxage: options.maxage || options.maxAge || 0
                    })
                      .on('headers', headers)
                      .pipe(res);
                  });
              })
              .catch(next);

          });

          return getPort();
        })
        .then(function(port) {
          locals.port = port;
          console.log(`Local storage port: ${port}`);
          locals.app.listen(port);
        });

    }
  };
};
