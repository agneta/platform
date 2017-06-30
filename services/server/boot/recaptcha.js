var request = require('request');

module.exports = function(app) {

    var configRecaptcha = app.get('recaptcha');
    if (!configRecaptcha) {
        console.console.warn('Could not find Recaptcha configuration');
        return;
    }

    app.recaptcha = {
        verify: function(response, cb) {

            var data = {
                body: {
                    'g-recaptcha-response': response
                }
            };

            var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + configRecaptcha.secretKey + "&response=" + response;

            request(verificationUrl, function(error, response, body) {
                body = JSON.parse(body);
                cb(body);
            });

        }
    };

};
