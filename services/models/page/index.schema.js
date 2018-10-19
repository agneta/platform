module.exports = {
  name: 'Page',
  base: 'PersistedModel',
  idInjection: true,
  options: {},
  properties: {
    dirId: {
      type: 'objectid'
    },
    title: {
      type: 'object'
    },
    path: {
      type: 'String',
      required: true
    },
    source: {
      type: 'string'
    },
    template: {
      type: 'string'
    }
  },
  relations: {
    directory: {
      type: 'belongsTo',
      model: 'Page_Directory',
      foreignKey: 'dirId'
    }
  },
  validations: [],
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
      principalId: '$everyone',
      permission: 'ALLOW',
      property: 'search'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'ALLOW',
      property: 'searchKeywords'
    }
  ],
  methods: {},
  indexes: {
    unique: {
      keys: {
        path: 1,
        app: 1
      },
      options: {
        unique: true
      }
    },
    fulltext: {
      keys: {
        title_keywords: 'text',
        description_keywords: 'text',
        content_keywords: 'text'
      },
      options: {
        weights: {
          title_keywords: 1,
          description_keywords: 5,
          content_keywords: 10
        }
      }
    }
  }
};
