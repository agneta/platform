module.exports = {
  name: 'Role_Administrator',
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
      principalId: 'administrator',
      permission: 'ALLOW'
    }
  ],
  methods: {},
  http: {
    path: 'role/administrator'
  }
};
