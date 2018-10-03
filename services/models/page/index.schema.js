module.exports = {
  name: 'Page',
  base: 'PersistedModel',
  idInjection: true,
  options: {},
  properties: {
    title: {
      type: 'String',
      required: true
    },
    title_keywords: {
      type: ['String'],
      required: false
    },
    description: {
      type: 'String',
      required: false
    },
    description_keywords: {
      type: ['String'],
      required: false
    },
    content: {
      type: ['String'],
      required: false
    },
    content_keywords: {
      type: ['String'],
      required: false
    },
    path: {
      type: 'String',
      required: true
    },
    source: {
      type: 'string',
      required: true
    },
    template: {
      type: 'string',
      required: false
    },
    authorization: {
      type: 'string',
      required: false
    },
    mtime: {
      type: 'date',
      required: false
    },
    lang: {
      type: 'String',
      required: true
    }
  },
  relations: {
    positions: {
      type: 'hasMany',
      model: 'Search_Position',
      foreignKey: 'pageId'
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
        source: 1,
        lang: 1
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
