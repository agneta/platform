module.exports = {
  name: 'Account_SSH',
  base: 'PersistedModel',
  idInjection: true,
  properties: {
    accountId: {
      type: 'String',
      required: false
    },
    title: {
      type: 'string',
      required: true
    },
    content: {
      type: 'string',
      required: true
    },
    createdAt: {
      type: 'date',
      required: true
    }
  },
  relations: {
    account: {
      type: 'belongsTo',
      model: 'Account',
      foreignKey: 'accountId'
    }
  }
};
