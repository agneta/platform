module.exports = {
  name: 'Activity_Item',
  base: 'PersistedModel',
  idInjection: true,
  options: {},
  properties: {
    accountId: {
      type: 'string',
      required: false
    },
    actionId: {
      type: 'string',
      required: false
    },
    feeds: {
      type: 'array',
      required: true,
      index: true
    },
    data: {
      type: 'object'
    },
    year: {
      type: 'number',
      required: true,
      index: true
    },
    month: {
      type: 'number',
      required: true,
      index: true
    },
    week: {
      type: 'number',
      required: true,
      index: true
    },
    dayOfYear: {
      type: 'number',
      required: true,
      index: true
    },
    hourOfYear: {
      type: 'number',
      required: true,
      index: true
    },
    time: {
      type: 'Date',
      required: true,
      index: true
    }
  },
  validations: [],
  hidden: [],
  relations: {
    account: {
      type: 'belongsTo',
      model: 'Account',
      foreignKey: 'accountId'
    },
    action: {
      type: 'belongsTo',
      model: 'Activity_Feed',
      foreignKey: 'actionId'
    }
  },
  indexes: {
    searchByMonth: {
      keys: {
        feeds: 1,
        month: 1,
        year: 1
      }
    }
  },
  acls: [
    {
      accessType: '*',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'DENY'
    }
  ],
  methods: {},
  http: {
    path: 'activity/item'
  }
};
