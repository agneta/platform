module.exports = {
  name: 'Role_Reviewer',
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
      principalId: 'reviewer',
      permission: 'ALLOW'
    }
  ],
  methods: {},
  http: {
    path: 'role/reviewer'
  }
};
