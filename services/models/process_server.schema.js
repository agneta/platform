module.exports = {
  name: 'Process_Server',
  base: 'PersistedModel',
  options: {
    name: {
      type: 'string',
      required: true
    },
    ipv4: {
      type: 'string',
      required: true
    }
  },
  mixins: {
    TimeStamp: {
      required: false
    }
  },
  indexes: {
    uniqueName: {
      keys: {
        name: 1
      },
      options: {
        unique: true
      }
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
  relations: {
    processes: {
      type: 'hasMany',
      model: 'Process',
      foreignKey: 'processServerId'
    }
  },
  methods: {}
};
