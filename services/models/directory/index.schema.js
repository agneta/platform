module.exports = {
  name: 'Directory',
  base: 'PersistedModel',
  options: {},
  properties: {
    name: {
      type: 'String',
      required: true
    },
    namespace: {
      type: 'String',
      required: true
    },
    path: {
      type: 'String',
      required: false
    }
  },
  indexes: {
    unique: {
      keys: {
        path: 1,
        namespace: 1
      },
      options: {
        unique: true
      }
    }
  }
};
