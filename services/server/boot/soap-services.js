var loopback = require('loopback');
var fs = require('fs-extra');
var path = require('path');
var Promise = require('bluebird');
var soap = require('soap');
var S = require('string');
var contentType = require('content-type');
var _ = require('lodash');
var uuidV1 = require('uuid/v1');
var simpleParser = require('mailparser').simpleParser;
var Request = require('request');
var concatStream = require('concat-stream');

module.exports = function(app) {

    app.soapServices = {};
    var config = app.get('wsdl');
    if (!config) {
        return;
    }

    var dirServices = config.path || path.join(app.get('services_dir'), 'wsdl');

    return fs.readdir(dirServices)
        .then(function(files) {

            return Promise.map(files, function(file) {

                var fileParsed = path.parse(file);
                var fileName = fileParsed.name;

                return new Promise(function(resolve, reject) {

                    soap.createClient(path.join(dirServices, file), {
                            wsdl_headers: {
                                connection: 'keep-alive'
                            },
                            request: function(options, cb) {
                                var request = Request(options, cb);
                                request.on('response', function(response) {
                                    response.pipe(concatStream({
                                        encoding: 'buffer'
                                    }, function(buffer) {
                                        request.bufferResult = buffer;
                                    }));
                                });
                                return request;
                            }
                        },
                        function(err, client) {

                            if (err) {
                                return reject(err);
                            }

                            switch (config.credentials.scheme) {
                                case 'BasicAuth':
                                    client.setSecurity(new soap.BasicAuthSecurity(
                                        config.credentials.username,
                                        config.credentials.password));
                                    break;
                                default:

                            }

                            var methodName = client.wsdl.definitions.$name;
                            var method = client[methodName];
                            var methodPromise = Promise.promisify(method);
                            var responses = {};

                            client.on('soapError', function() {
                                console.log(arguments);
                            });

                            client.on('response', function(result, incomingMessage, exchangeId) {

                                var responseParsed = responses[exchangeId];
                                if (!responseParsed) {
                                    return;
                                }

                                delete responses[exchangeId];

                                if (!result) {
                                    return responseParsed.reject('No incoming response. Check the log for errors');
                                }

                                var resContentType = incomingMessage.headers['content-type'];
                                var attachments = [];

                                Promise.resolve()
                                    .then(function() {

                                        var buffer = Buffer.concat([
                                            Buffer.from('content-type: ' + resContentType + '\r\n', 'utf8'),
                                            incomingMessage.request.bufferResult
                                        ]);

                                        return simpleParser(buffer)
                                            .then(function(parsed) {
                                                attachments = parsed.attachments;
                                            });

                                    })
                                    .then(function() {

                                        responseParsed.resolve({
                                            attachments: attachments,
                                            raw: result
                                        });

                                    });


                            });

                            app.soapServices[fileName] = {
                                getResult: methodPromise,
                                getDetails: function(query) {

                                    return new Promise(function(resolve, reject) {

                                        var uuid = uuidV1();

                                        responses[uuid] = {
                                            resolve: resolve,
                                            reject: reject
                                        };

                                        method(query, function(err, result, raw, soapHeader) {
                                            if (err) {
                                                return reject(err);
                                            }
                                        }, {
                                            exchangeId: uuid
                                        });
                                    });
                                }
                            };

                            resolve();

                        });
                });

            });
        });

};
