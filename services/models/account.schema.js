module.exports = {
  name: 'Account',
  base: 'User',
  properties: {
    name: {
      type: 'String',
      required: false
    },
    picture: {
      type: 'object'
    },
    deactivated: {
      type: 'boolean'
    },
    verifiedAt: {
      type: 'Date'
    },
    veriSentAt: {
      type: 'Date'
    }
  },
  hidden: ['password'],
  validations: [],
  relations: {
    forms: {
      type: 'hasMany',
      model: 'Form',
      foreignKey: 'accountId'
    },
    ssh: {
      type: 'hasMany',
      model: 'Account_SSH',
      foreignKey: 'accountId'
    },
    cert: {
      type: 'hasMany',
      model: 'Account_Cert',
      foreignKey: 'accountId'
    },
    ip_whitelist: {
      type: 'hasMany',
      model: 'Account_IP',
      foreignKey: 'accountId'
    },
    accessTokens: {
      type: 'hasMany',
      model: 'AccountToken',
      foreignKey: 'userId',
      options: {
        disableInclude: true
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
      principalType: 'ROLE',
      principalId: '$authenticated',
      permission: 'ALLOW',
      property: 'passwordChange'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'ALLOW',
      property: 'me'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'ALLOW',
      property: 'signIn'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$authenticated',
      permission: 'ALLOW',
      property: 'activities'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$authenticated',
      permission: 'ALLOW',
      property: 'signOut'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$authenticated',
      permission: 'ALLOW',
      property: 'signOutAll'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$authenticated',
      permission: 'ALLOW',
      property: 'deactivate'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$authenticated',
      permission: 'ALLOW',
      property: 'recover'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$authenticated',
      permission: 'ALLOW',
      property: 'pictureChange'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'ALLOW',
      property: 'register'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'ALLOW',
      property: 'resendVerification'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'ALLOW',
      property: 'verifyEmail'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'ALLOW',
      property: 'requestPassword'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'ALLOW',
      property: 'requestRecovery'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'ALLOW',
      property: 'signedIn'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'ALLOW',
      property: 'hasRoles'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$everyone',
      permission: 'ALLOW',
      property: 'roleList'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$authenticated',
      permission: 'ALLOW',
      property: 'mediaGet'
    },
    {
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$authenticated',
      permission: 'ALLOW',
      property: 'mediaUpload'
    }
  ],
  methods: {},
  indexes: {
    fulltext: {
      keys: {
        email: 'text',
        username: 'text',
        name: 'text'
      },
      options: {
        weights: {
          name: 1,
          username: 5,
          email: 10
        }
      }
    },
    uniqueEmail: {
      keys: {
        email: 1
      },
      options: {
        unique: true
      }
    },
    uniqueUsername: {
      keys: {
        username: 1
      },
      options: {
        unique: true,
        sparse: true
      }
    }
  }
};
