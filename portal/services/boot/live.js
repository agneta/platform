var express = require('express');
var cheerio = require('cheerio');
var path = require('path');
var interceptor = require('express-interceptor');

module.exports = function(app) {

    return;
    var basePath = '/live';

    var finalParagraphInterceptor = interceptor(function(req, res) {
        return {
            // Only HTML responses will be intercepted
            isInterceptable: function() {
                return /text\/html/.test(res.get('Content-Type'));
            },
            // Appends a paragraph at the end of the response body
            intercept: function(body, send) {
                var $ = cheerio.load(body, {});

                fixPaths('script[src]', 'src');
                fixPaths('a[href], link[href]', 'href');
                fixPaths('*', 'ng-href');

                function fixPaths(selector, name) {
                    $(selector).each(function() {
                        var elm = $(this);
                        var value = elm.attr(name);
                        if (!value) {
                            return;
                        }
                        if (value[0] == '/' && value[1] != '/') {
                            elm.attr(name, basePath + value);
                        }
                    });
                }

                var html = $.html();
                html = html.replace('root: "",', 'root: "' + basePath + '",');

                send(html);
            }
        };
    });

    // Add the interceptor middleware
    app.use(basePath, finalParagraphInterceptor);

};
