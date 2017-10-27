var minimatch = require('minimatch');
const Request = require('request');
const concatStream = require('concat-stream');

module.exports = function(app) {

  var overrideRules = app.get('wsdl').override || [];
  const soapSecurity = require('./security')(app);

  return function(options) {
    //console.log('soap:request:options',options);

    return function(requestOptions, cb) {
      soapSecurity({
        servicePath: options.servicePath,
        requestOptions: requestOptions
      })
        .then(function() {

          //console.log(options);
          //---------------------------------------------------
          //console.log('soap:request:requestOptions',requestOptions);
          for (var key in overrideRules) {

            var isMatch = minimatch(options.serviceFilePath, key);
            console.log('soap:request:isMatch',options.serviceFilePath,key,isMatch);
            if (isMatch) {
              var rule = overrideRules[key];
              if (rule.endpoint) {
                console.log(`change endpoint to ${rule.endpoint}`);
              }
            }

          }

          var request = Request(requestOptions,cb);

          request.on('response', function(response) {
            response.pipe(concatStream({
              encoding: 'buffer'
            }, function(buffer) {
              request.bufferResult = buffer;
            }));
          });


        })
        .catch(cb);
    };
  };
};
