module.exports = {
  name: 'Account_Cert',
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
    pfxFileId: {
      type: 'string',
      index: true
    },
    pfxPass: {
      type: 'string',
      required: false
    },
    fingerprint: {
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
    },
    pfxFile: {
      type: 'belongsTo',
      model: 'Attachment',
      foreignKey: 'pfxFileId'
    }
  },
  hidden: ['pfxPass']
};
