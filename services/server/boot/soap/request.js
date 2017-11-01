const minimatch = require('minimatch');
const Request = require('request');
const concatStream = require('concat-stream');
const _ = require('lodash');

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
            //console.log('soap:request:isMatch',options.serviceFilePath,key,isMatch);
            if (isMatch) {
              var rule = overrideRules[key];
              if (rule.endpoint) {

                var req = requestOptions.methodOptions.req;

                if (!req) {
                  return Promise.reject({
                    message: 'Expected req object to be present in methodOptions.'
                  });
                }

                //--------------------------------------------------------
                var checkKey = _.get(req.accessToken, rule.endpoint.key);

                if (!checkKey) {
                  return Promise.reject({
                    statusCode: 401,
                    message: 'Expected a rule key to be present in methodOptions.'
                  });
                }

                //--------------------------------------------------------

                var mapValue = rule.endpoint.map[checkKey];

                if (!mapValue) {
                  return Promise.reject({
                    statusCode: 401,
                    message: 'Expected the Map key to be present in endpoint override config.'
                  });
                }

                //--------------------------------------------------------

                var checkValue = rule.endpoint.value[mapValue];

                if (!checkValue) {
                  return Promise.reject({
                    statusCode: 401,
                    message: 'Expected the Value key to be present in endpoint override config.'
                  });
                }

                requestOptions.uri = _.template(requestOptions.uri.href, {
                  interpolate: /__:(.+?):__/g
                })(checkValue);
              }
            }

          }

          var request = Request(requestOptions, cb);

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
