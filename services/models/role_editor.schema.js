module.exports = {
  name: 'Role_Editor',
  base: 'AccountRole',
  idInjection: true,
  options: {},
  properties: {},
  validations: [],
  mixins: {},
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
      principalId: 'editor',
      permission: 'ALLOW'
    }
  ],
  methods: {},
  http: {
    path: 'role/editor'
  }
};
