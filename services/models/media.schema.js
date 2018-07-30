module.exports = {
  name: 'Media',
  base: 'PersistedModel',
  properties: {
    location: {
      type: 'string',
      required: true
    },
    contentType: {
      type: 'string',
      required: false
    },
    image: {
      type: 'object',
      required: false
    },
    type: {
      type: 'string',
      required: true
    },
    lastModified: {
      type: 'string',
      required: false
    },
    size: {
      type: 'string'
    },
    isSize: {
      type: 'boolean'
    }
  },
  mixins: {
    TimeStamp: {
      required: false
    }
  },
  validations: [],
  relations: {},
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
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: 'editor',
      permission: 'ALLOW'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: 'editor',
      permission: 'ALLOW',
      property: 'search'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: 'editor',
      permission: 'ALLOW',
      property: 'searchKeywords'
    }
  ],
  indexes: {
    fulltext: {
      keys: {
        location_keywords: 'text'
      },
      options: {
        weights: {
          location_keywords: 1
        }
      }
    }
  },
  methods: {}
};
