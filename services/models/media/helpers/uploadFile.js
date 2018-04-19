const Busboy = require('busboy');
const Promise = require('bluebird');
const _ = require('lodash');
module.exports = function(Model) {

  Model.__uploadFile = function(options) {

    var req = options.req;
    var busboy = new Busboy({
      headers: req.headers
    });
    var formData = {};

    return Promise.resolve()
      .then(function(){
        if(!options.field){
          throw new Error('Must define the option field before uploading');
        }
      })
      .then(function(){
        return new Promise(function(resolve, reject) {
          busboy.on('file', function(fieldname, stream, filename, encoding, mimetype) {
            if(fieldname!=options.field){
              return;
            }

            var uploadOptions = _.extend(
              {},
              formData,
              _.pick(options,['location','dir','name'])
            );

            return Promise.resolve()
              .then(function() {
                return Model.__prepareFile({
                  mimetype: mimetype,
                  originalname: filename,
                  stream: stream
                }, uploadOptions);
              })
              .then(function(result) {
                resolve(result);
              });
          });

          busboy.on('field', function(fieldname, val) {
            //console.log('Field [' + fieldname + ']: value: ' + val);
            formData[fieldname] = val;
            if(options.onField){
              options.onField(fieldname,val);
            }
          });

          busboy.on('error', function(err) {
            reject(err);
          });
          req.pipe(busboy);
        });
      });

  };

};
