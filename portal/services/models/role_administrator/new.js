module.exports = function(Model) {

  Model.new = function(options) {

    var Account = Model.getModel('Account');

    if (!options.email) {
      throw new Error('Must provide an email for administrator creation');
    }

    return Account.findOne({
      where: {
        email: options.email
      }
    })
      .then(function(account) {

        if (!account) {
          return Account.create({
            email: options.email,
            password: options.password || 'password',
            emailVerified: true,
            language: 'en'
          });
        }

        return account;

      })
      .then(function(account) {

        return Account._roleAdd(account.id,'administrator');

      });

  };
};
