var _ = require('lodash');

module.exports = function(Model, app) {

  Model.new = function(email, password) {

      return Model.create({
              email: email,
              password: password
          })
          .then(function() {
              return {
                  success: 'The account is created.'
              };
          });

  };

  Model.remoteMethod(
      'new', {
          description: 'Create user with email and password.',
          accepts: [{
              arg: 'email',
              type: 'string',
              required: true,
          }, {
              arg: 'password',
              type: 'string',
              required: true
          }],
          returns: {
              arg: 'result',
              type: 'object',
              root: true
          },
          http: {
              verb: 'post',
              path: '/new'
          }
      }
  );

};
