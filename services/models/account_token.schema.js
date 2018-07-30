module.exports = {
  name: 'AccountToken',
  base: 'AccessToken',
  idInjection: false,
  relations: {
    user: {
      type: 'belongsTo',
      model: 'Account',
      foreignKey: 'userId'
    }
  }
};
