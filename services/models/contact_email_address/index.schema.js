module.exports = {
  name: 'Contact_Email_Address',
  base: 'PersistedModel',
  properties: {
    type: {
      type: 'string'
    },
    date: {
      type: 'date'
    },
    emailId: {
      type: 'string',
      required: true
    },
    addressId: {
      type: 'string',
      required: true
    }
  },
  validations: [],
  relations: {
    email: {
      type: 'belongsTo',
      model: 'Contact_Email',
      foreignKey: 'emailId'
    },
    address: {
      type: 'belongsTo',
      model: 'Contact_Address',
      foreignKey: 'addressId'
    }
  },
  indexes: {
    email: {
      keys: {
        addressId: 1,
        emailId: 1,
        type: 1
      },
      options: {
        unique: true
      }
    }
  }
};
