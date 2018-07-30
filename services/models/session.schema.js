module.exports = {
  name: 'Session',
  base: 'PersistedModel',
  idInjection: true,
  options: {},
  properties: {
    expired: {
      type: 'Date',
      required: false
    },
    activityId: {
      type: 'String',
      required: false
    },
    data: {
      type: 'Object',
      required: false
    },
    views: {
      type: 'Array',
      required: false
    }
  },
  validations: [],
  relations: {
    activity: {
      type: 'belongsTo',
      model: 'Activity_Item',
      foreignKey: 'activityId'
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
  methods: {}
};
