module.exports = {
  name: 'Process',
  base: 'PersistedModel',
  options: {
    host: {
      type: 'string',
      required: true
    },
    endpoint: {
      type: 'string',
      required: true
    },
    env: {
      type: 'string',
      required: true
    },
    mode: {
      type: 'string',
      required: true
    },
    branch: {
      type: 'string',
      required: true
    },
    lastStarted: {
      type: 'date',
      required: true
    }
  },
  mixins: {
    TimeStamp: {
      required: false
    }
  },
  indexes: {
    unique: {
      keys: {
        host: 1,
        ip: 1,
        email: 1
      },
      options: {
        unique: true
      }
    }
  },
  relations: {
    _commit_current: {
      type: 'embedsOne',
      model: 'Commit',
      property: 'commit_current',
      options: {
        validate: true,
        forceId: false
      }
    },
    _commit_update: {
      type: 'embedsOne',
      model: 'Commit',
      property: 'commit_update',
      options: {
        validate: true,
        forceId: false
      }
    },
    processServer: {
      type: 'belongsTo',
      model: 'Process_Server',
      foreignKey: 'processServerId'
    }
  },
  acls: [
    {
      accessType: '*',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'DENY'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: 'administrator',
      permission: 'ALLOW'
    }
  ],
  methods: {}
};
