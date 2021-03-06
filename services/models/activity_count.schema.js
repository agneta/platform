module.exports = {
  name: 'Activity_Count',
  base: 'PersistedModel',
  idInjection: true,
  strictObjectIDCoercion: true,
  properties: {
    feedId: {
      type: 'string',
      index: true,
      required: true
    },
    year: {
      type: 'number',
      index: true,
      required: true
    },
    key: {
      type: 'number',
      index: true,
      required: true
    },
    total: {
      type: 'number',
      required: false,
      default: 0
    },
    type: {
      type: 'string',
      index: true,
      required: true
    },
    parentId: {
      type: 'string',
      index: true
    }
  },
  validations: [],
  hidden: [],
  relations: {
    feed: {
      type: 'belongsTo',
      model: 'Activity_Feed',
      foreignKey: 'feedId'
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
  cloudant: {
    database: 'analytics'
  },
  methods: {},
  http: {
    path: 'activity/count'
  }
};
