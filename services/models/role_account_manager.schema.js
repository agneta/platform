module.exports = {
  name: 'Role_Account_Manager',
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
    }
  ],
  methods: {},
  http: {
    path: 'role/account-manager'
  }
};
