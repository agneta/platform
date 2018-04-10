const Busboy = require('busboy');
const Promise = require('bluebird');

module.exports = function(Model) {

  Model.__uploadFile = function(options) {

    var req = options.req;
    var busboy = new Busboy({
      headers: req.headers
    });
    var formData = {};
    var promises = [];
    if(!options.field){
      throw new Error('Must define the option field before uploading');
    }


    return new Promise(function(resolve, reject) {
      busboy.on('file', function(fieldname, stream, filename, encoding, mimetype) {
        console.log(fieldname);
        if(fieldname!=options.field){
          return;
        }
        //console.log(fieldname,formData);

        var promise = Promise.resolve()
          .then(function() {
            return Model.__prepareFile({
              mimetype: mimetype,
              originalname: filename,
              stream: stream
            }, {
              dir: formData.dir
            });
          });

        promises.push(promise);
      });

      busboy.on('field', function(fieldname, val) {
        //console.log('Field [' + fieldname + ']: value: ' + val);
        formData[fieldname] = val;
      });

      busboy.on('error', function(err) {
        reject(err);
      });
      req.pipe(busboy);

    })
      .then(function(){



      });

  };

};
