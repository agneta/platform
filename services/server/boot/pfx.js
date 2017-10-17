const tls = require('tls');

module.exports = function(app) {

  function validate(options) {

    try {
      tls.createSecureContext(options);
    } catch (err) {
      return false;
    }

    return true;
  }

  app.pfx = {
    validate: validate
  };

};
